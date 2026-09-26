import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  AuthSessionResponse,
  AuthenticatedUserDto,
  AccessRequestPayloadDto,
  AccessRequestResponse,
  AccessRequestStatusResponse,
} from './auth.types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: any): Promise<AuthSessionResponse> {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const ua = req.headers['user-agent'];
    return this.authService.login(loginDto, ip, ua);
  }

  @Post('access-requests')
  @HttpCode(HttpStatus.CREATED)
  async createAccessRequest(
    @Body() payload: AccessRequestPayloadDto,
    @Req() req: any,
  ): Promise<AccessRequestResponse> {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const ua = req.headers['user-agent'];
    return this.authService.createAccessRequest(payload, ip, ua);
  }

  @Get('access-requests/:applicationNumber')
  async getAccessRequestStatus(
    @Param('applicationNumber') applicationNumber: string,
  ): Promise<AccessRequestStatusResponse> {
    return this.authService.getAccessRequestStatus(applicationNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any): Promise<AuthenticatedUserDto> {
    return req.user;
  }
}
