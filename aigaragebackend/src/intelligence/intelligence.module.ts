import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { RelationshipsController } from './relationships.controller';
import { RelationshipsService } from './relationships.service';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { FindingsController } from './findings.controller';
import { FindingsService } from './findings.service';
import { EntityResolutionController } from './entity-resolution.controller';
import { EntityResolutionService } from './entity-resolution.service';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    EntitiesController,
    CasesController,
    RelationshipsController,
    TimelineController,
    LocationsController,
    EvidenceController,
    FindingsController,
    EntityResolutionController,
  ],
  providers: [
    EntitiesService,
    CasesService,
    RelationshipsService,
    TimelineService,
    LocationsService,
    EvidenceService,
    FindingsService,
    EntityResolutionService,
  ],
  exports: [
    EntitiesService,
    CasesService,
    RelationshipsService,
    TimelineService,
    LocationsService,
    EvidenceService,
    FindingsService,
    EntityResolutionService,
  ],
})
export class IntelligenceModule {}
