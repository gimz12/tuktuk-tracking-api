import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { DevicesService } from '../devices/devices.service';
import { Role } from '../../common/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    @Inject(forwardRef(() => DevicesService))
    private readonly devices: DevicesService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async loginUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await this.users.verifyPassword(user, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id.toString(), role: user.role, scope: 'user' };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '8h',
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        provinceId: user.provinceId?.toString() ?? null,
        districtId: user.districtId?.toString() ?? null,
        stationId: user.stationId?.toString() ?? null,
      },
    };
  }

  async issueDeviceToken(deviceId: string, deviceSecret: string) {
    const device = await this.devices.verifySecret(deviceId, deviceSecret);
    if (!device) {
      throw new UnauthorizedException('Invalid device credentials');
    }
    if (!device.tuktukId) {
      throw new UnauthorizedException('Device is not assigned to a tuk-tuk');
    }
    const payload = {
      sub: device._id.toString(),
      deviceId: device.deviceId,
      tuktukId: device.tuktukId.toString(),
      role: Role.DEVICE,
      scope: 'device',
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_DEVICE_SECRET'),
      expiresIn: this.config.get<string>('JWT_DEVICE_EXPIRES_IN') ?? '30d',
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      device: {
        id: device._id.toString(),
        deviceId: device.deviceId,
        tuktukId: device.tuktukId.toString(),
      },
    };
  }
}
