import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/roles.enum';

interface UserJwtPayload {
  sub: string;
  role: Role;
  scope: 'user';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(config: ConfigService, private readonly users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: UserJwtPayload): Promise<AuthenticatedUser> {
    if (payload.scope !== 'user') {
      throw new UnauthorizedException('Invalid token scope');
    }
    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User inactive or missing');
    }
    return {
      sub: user._id.toString(),
      role: user.role,
      provinceId: user.provinceId?.toString() ?? null,
      districtId: user.districtId?.toString() ?? null,
      stationId: user.stationId?.toString() ?? null,
    };
  }
}
