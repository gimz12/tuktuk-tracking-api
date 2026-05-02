import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../common/roles.enum';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';

interface DeviceJwtPayload {
  sub: string;
  deviceId: string;
  tuktukId: string;
  scope: 'device';
}

@Injectable()
export class DeviceJwtStrategy extends PassportStrategy(Strategy, 'device-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_DEVICE_SECRET'),
    });
  }

  async validate(payload: DeviceJwtPayload): Promise<AuthenticatedUser> {
    if (payload.scope !== 'device') {
      throw new UnauthorizedException('Invalid token scope');
    }
    return {
      sub: payload.sub,
      role: Role.DEVICE,
      deviceId: payload.deviceId,
      tuktukId: payload.tuktukId,
    };
  }
}
