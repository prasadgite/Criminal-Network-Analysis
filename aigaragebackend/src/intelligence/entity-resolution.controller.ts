import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EntityResolutionService } from './entity-resolution.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/authorization/permissions';

@Controller('intelligence/entity-resolution')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EntityResolutionController {
  constructor(private readonly resolutionService: EntityResolutionService) {}

  @Get('health')
  @RequirePermissions(PERMISSIONS.ENTITIES_VIEW)
  async getHealth() {
    return this.resolutionService.getHealth();
  }

  @Post('extract')
  @RequirePermissions(PERMISSIONS.ENTITIES_VIEW)
  async extractEntities(@Body() body: { text: string; documentId?: string; caseId?: string }) {
    return this.resolutionService.extractEntities(body.text, body.documentId, body.caseId);
  }

  @Post('analyze-fir')
  @RequirePermissions(PERMISSIONS.ENTITIES_VIEW)
  async analyzeFIR(@Body() body: { text: string; caseId?: string; documentId?: string }) {
    return this.resolutionService.analyzeFIR(body.text, body.caseId, body.documentId);
  }

  @Get('person/:id')
  @RequirePermissions(PERMISSIONS.ENTITIES_VIEW)
  async getPerson(@Param('id') id: string) {
    return this.resolutionService.getPerson(id);
  }
}
