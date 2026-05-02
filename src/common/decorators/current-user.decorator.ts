import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../roles.enum';

export interface AuthenticatedUser {
  sub: string;
  role: Role;
  provinceId?: string | null;
  districtId?: string | null;
  stationId?: string | null;
  tuktukId?: string | null;
  deviceId?: string | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
