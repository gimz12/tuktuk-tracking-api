import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TuktuksService } from './tuktuks.service';
import { Role } from '../../common/roles.enum';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('TuktuksService scope filtering', () => {
  let service: TuktuksService;

  beforeEach(() => {
    service = new TuktuksService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  const adminUser: AuthenticatedUser = { sub: 'a1', role: Role.ADMIN };
  const provinceAdmin: AuthenticatedUser = {
    sub: 'p1',
    role: Role.PROVINCE_ADMIN,
    provinceId: '670000000000000000000001',
  };
  const stationOfficer: AuthenticatedUser = {
    sub: 's1',
    role: Role.STATION_OFFICER,
    stationId: '670000000000000000000002',
  };

  it('returns an empty filter for an HQ admin without query params', () => {
    expect(service.buildScopedFilter(adminUser)).toEqual({});
  });

  it('locks a province admin to their own province', () => {
    const filter = service.buildScopedFilter(provinceAdmin);
    expect(filter.provinceId?.toString()).toBe(provinceAdmin.provinceId);
  });

  it('rejects a province admin trying to widen scope to another province', () => {
    expect(() =>
      service.buildScopedFilter(provinceAdmin, {
        provinceId: '670000000000000000000099',
      }),
    ).toThrow(BadRequestException);
  });

  it('locks a station officer to their station', () => {
    const filter = service.buildScopedFilter(stationOfficer);
    expect(filter.stationId?.toString()).toBe(stationOfficer.stationId);
  });

  it('rejects a province admin without a scoped provinceId set', () => {
    const broken: AuthenticatedUser = { sub: 'p2', role: Role.PROVINCE_ADMIN };
    expect(() => service.buildScopedFilter(broken)).toThrow(BadRequestException);
  });
});

describe('TuktuksService.assertVisibleTo', () => {
  const tuktukId = new Types.ObjectId('670000000000000000000010');
  const provinceId = new Types.ObjectId('670000000000000000000001');
  const stationId = new Types.ObjectId('670000000000000000000002');

  const fakeTuktuk = {
    _id: tuktukId,
    provinceId,
    stationId,
  };

  let service: TuktuksService;

  beforeEach(() => {
    service = new TuktuksService(
      { findById: jest.fn().mockResolvedValue(fakeTuktuk) } as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it('lets HQ admin see any tuk-tuk', async () => {
    const admin: AuthenticatedUser = { sub: 'a', role: Role.ADMIN };
    await expect(service.assertVisibleTo(admin, tuktukId.toString())).resolves.toEqual(
      fakeTuktuk,
    );
  });

  it("hides a tuk-tuk in a different province from a province admin", async () => {
    const otherProvinceAdmin: AuthenticatedUser = {
      sub: 'p',
      role: Role.PROVINCE_ADMIN,
      provinceId: '670000000000000000000099',
    };
    await expect(
      service.assertVisibleTo(otherProvinceAdmin, tuktukId.toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it("hides a tuk-tuk in another station from a station officer", async () => {
    const otherStationOfficer: AuthenticatedUser = {
      sub: 's',
      role: Role.STATION_OFFICER,
      stationId: '670000000000000000000099',
    };
    await expect(
      service.assertVisibleTo(otherStationOfficer, tuktukId.toString()),
    ).rejects.toThrow(NotFoundException);
  });
});
