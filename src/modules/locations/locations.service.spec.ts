import { BadRequestException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Role } from '../../common/roles.enum';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('LocationsService.history', () => {
  let service: LocationsService;
  let model: { find: jest.Mock };

  beforeEach(() => {
    model = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    };
    service = new LocationsService(model as never);
  });

  const admin: AuthenticatedUser = { sub: 'a', role: Role.ADMIN };

  it('rejects when "from" is later than "to"', async () => {
    await expect(
      service.history(admin, {}, {
        from: '2026-04-29T00:00:00.000Z',
        to: '2026-04-22T00:00:00.000Z',
        limit: 100,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects windows wider than 31 days', async () => {
    await expect(
      service.history(admin, {}, {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-04-01T00:00:00.000Z',
        limit: 100,
      }),
    ).rejects.toThrow(/31 days/);
  });

  it('rejects invalid date strings', async () => {
    await expect(
      service.history(admin, {}, {
        from: 'not-a-date',
        to: '2026-04-29T00:00:00.000Z',
        limit: 100,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('queries the model with the supplied scope and time window', async () => {
    await service.history(admin, {}, {
      from: '2026-04-22T00:00:00.000Z',
      to: '2026-04-29T00:00:00.000Z',
      limit: 100,
    });
    expect(model.find).toHaveBeenCalledTimes(1);
    const calledWith = model.find.mock.calls[0][0];
    expect(calledWith.recordedAt.$gte).toBeInstanceOf(Date);
    expect(calledWith.recordedAt.$lte).toBeInstanceOf(Date);
  });
});
