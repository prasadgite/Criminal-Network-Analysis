import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload, AuthenticatedUserDto } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'sandhaan_intelligence_secret_key_jwt_2026_investigator'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    if (!payload?.investigatorId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.authService.validateInvestigatorById(payload.investigatorId);
    if (!user) {
      throw new UnauthorizedException('Investigator not authorized or account is inactive');
    }

    return user;
  }
}
