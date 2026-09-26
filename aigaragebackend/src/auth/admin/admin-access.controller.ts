import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { PERMISSIONS } from '../authorization/permissions';
import { AdminAccessService } from './admin-access.service';
import { ReviewAccessRequestDto } from './dto/review-access-request.dto';
import { AccessRequestQueryDto } from './dto/access-request-query.dto';

@Controller('admin/access-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@RequirePermissions(PERMISSIONS.ACCESS_REVIEW)
@Roles('CYBER_CELL_ADMIN', 'administrator')
export class AdminAccessController {
  constructor(private readonly adminAccessService: AdminAccessService) {}

  @Get()
  async listAccessRequests(@Query() query: AccessRequestQueryDto) {
    return this.adminAccessService.listAccessRequests(query);
  }

  @Get(':id')
  async getAccessRequestById(@Param('id') id: string) {
    return this.adminAccessService.getAccessRequestById(id);
  }

  @Patch(':id/review')
  @HttpCode(HttpStatus.OK)
  async reviewAccessRequest(
    @Param('id') id: string,
    @Body() dto: ReviewAccessRequestDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const ua = req.headers['user-agent'];
    return this.adminAccessService.reviewAccessRequest(id, dto, req.user, ip, ua);
  }
}
