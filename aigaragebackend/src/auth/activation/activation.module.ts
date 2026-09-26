import { Module } from '@nestjs/common';
import { ActivationController } from './activation.controller';
import { ActivationService } from './activation.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [ActivationController],
  providers: [ActivationService, AuditService],
  exports: [ActivationService],
})
export class ActivationModule {}
