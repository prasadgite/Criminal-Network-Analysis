import { CanActivate,ExecutionContext,ForbiddenException,Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { hasPermission,Permission } from '../authorization/permissions';
@Injectable()
export class PermissionsGuard implements CanActivate {
 constructor(private readonly reflector:Reflector,private readonly audit:AuditService){}
 async canActivate(context:ExecutionContext){
  const required=this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY,[context.getHandler(),context.getClass()]);
  if(!required?.length)return true;
  const request=context.switchToHttp().getRequest<Request>();
  const user=request.user as {userId?:string;role?:string}|undefined;
  const allowed=required.every(p=>hasPermission(user?.role,p));
  if(allowed)return true;
  await this.audit.record('AUTHORIZATION_DENIED','api_route',`${request.method} ${request.originalUrl}`.slice(0,120),'DENIED',{ipAddress:request.ip,userAgent:request.headers['user-agent'],actorInvestigatorId:user?.userId},{role:user?.role??null,requiredPermissions:required});
  throw new ForbiddenException({code:'INSUFFICIENT_PERMISSION',message:'Your account does not have permission to perform this operation.',requiredPermissions:required});
 }
}
