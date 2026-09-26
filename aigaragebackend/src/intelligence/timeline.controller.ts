import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/timeline')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.TIMELINE_VIEW)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  async getTimeline(
    @Query('caseId') caseId?: string,
    @Query('entityId') entityId?: string,
    @Query('eventType') eventType?: string,
    @Query('limit') limit?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 50;
    return this.timelineService.getTimeline(caseId, entityId, eventType, l);
  }
}
