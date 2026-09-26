import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { ActivationService } from './activation.service';
import { ActivateAccountDto } from './dto/activate-account.dto';

@Controller('auth/activation')
export class ActivationController {
  constructor(private readonly service: ActivationService) {}

  @Get('status')
  getStatus(@Query('investigatorId') investigatorId: string) {
    return this.service.getStatus(investigatorId);
  }

  @Post()
  activate(
    @Body() dto: ActivateAccountDto,
    @Req() req: Request,
  ) {
    return this.service.activate(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
