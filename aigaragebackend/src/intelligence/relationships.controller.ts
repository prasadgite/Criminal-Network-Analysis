import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/relationships')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.NETWORK_VIEW)
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Get()
  async getRelationships(
    @Query('entityId') entityId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 50;
    return this.relationshipsService.getRelationships(entityId, type, l);
  }

  @Get('graph/:entityId')
  async getNetworkGraph(
    @Param('entityId') entityId: string,
    @Query('depth') depth?: string,
  ) {
    const d = depth ? parseInt(depth, 10) : 2;
    return this.relationshipsService.getNetworkGraph(entityId, d);
  }
}
