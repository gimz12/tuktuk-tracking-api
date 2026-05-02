export enum Role {
  ADMIN = 'admin',
  PROVINCE_ADMIN = 'province_admin',
  STATION_OFFICER = 'station_officer',
  DEVICE = 'device',
}

export const USER_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROVINCE_ADMIN,
  Role.STATION_OFFICER,
];
