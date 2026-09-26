import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CaseQueryDto } from './dto/case-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/cases')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.CASES_VIEW)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  async list(@Query() query: CaseQueryDto) {
    const limit = query.limit ?? 25;
    const offset = query.offset ?? 0;
    return this.casesService.listCases(
      query.status,
      query.priority,
      query.search,
      limit,
      offset,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.casesService.getCaseById(id);
  }
}

