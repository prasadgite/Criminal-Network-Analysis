import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/evidence')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.EVIDENCE_VIEW)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async list(
    @Query('caseId') caseId?: string,
    @Query('type') evidenceType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 50;
    const o = offset ? parseInt(offset, 10) : 0;
    return this.evidenceService.listEvidence(caseId, evidenceType, l, o);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.evidenceService.getEvidenceById(id);
  }
}
