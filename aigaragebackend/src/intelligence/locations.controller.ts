import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/locations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.LOCATIONS_VIEW)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async list(
    @Query('city') city?: string,
    @Query('q') query?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 50;
    const o = offset ? parseInt(offset, 10) : 0;
    return this.locationsService.listLocations(city, query, l, o);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.locationsService.getLocationById(id);
  }
}
