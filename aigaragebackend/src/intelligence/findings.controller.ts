import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FindingsService } from './findings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/findings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.FINDINGS_VIEW)
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Get()
  async getFindings(
    @Query('caseId') caseId?: string,
    @Query('limit') limit?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 30;
    return this.findingsService.generateFindings(caseId, l);
  }
}
