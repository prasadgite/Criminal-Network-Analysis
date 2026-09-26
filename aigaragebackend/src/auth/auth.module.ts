import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminAccessController } from './admin/admin-access.controller';
import { AdminAccessService } from './admin/admin-access.service';
import { AuditService } from './audit/audit.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

import { ActivationModule } from './activation/activation.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'sandhaan_intelligence_secret_key_jwt_2026_investigator',
        ),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
    ActivationModule,
  ],
  controllers: [AuthController, AdminAccessController],
  providers: [
    AuthService,
    AdminAccessService,
    AuditService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthService,
    AdminAccessService,
    AuditService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
