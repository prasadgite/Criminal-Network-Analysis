import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EntitiesService, InvestigationEntityType } from './entities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/entities')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.ENTITIES_VIEW)
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get('counts')
  async getCounts() {
    return this.entitiesService.getEntityCounts();
  }

  @Get()
  async search(
    @Query('q') query?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 50;
    const o = offset ? parseInt(offset, 10) : 0;
    return this.entitiesService.searchEntities(query, type, l, o);
  }

  @Get(':type/:id')
  async getById(
    @Param('type') type: InvestigationEntityType,
    @Param('id') id: string,
  ) {
    return this.entitiesService.getEntityById(type, id);
  }
}
