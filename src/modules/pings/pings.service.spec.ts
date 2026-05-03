import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PingsService } from './pings.service';

describe('PingsService.ingest', () => {
  let service: PingsService;
  let tuktukService: { findById: jest.Mock };
  let deviceService: { touchLastSeen: jest.Mock };
  let model: { insertMany: jest.Mock };

  const tuktukId = new Types.ObjectId('670000000000000000000010');
  const deviceMongoId = new Types.ObjectId('670000000000000000000020');
  const stationId = new Types.ObjectId('670000000000000000000030');
  const districtId = new Types.ObjectId('670000000000000000000040');
  const provinceId = new Types.ObjectId('670000000000000000000050');

  const validPing = {
    lat: 6.9344,
    lng: 79.8428,
    recordedAt: '2026-04-29T08:30:00.000Z',
    speedKph: 35,
    headingDeg: 142,
  };

  beforeEach(() => {
    model = { insertMany: jest.fn().mockResolvedValue([{}]) };
    tuktukService = {
      findById: jest.fn().mockResolvedValue({
        _id: tuktukId,
        deviceId: deviceMongoId,
        stationId,
        districtId,
        provinceId,
      }),
    };
    deviceService = { touchLastSeen: jest.fn().mockResolvedValue(undefined) };
    service = new PingsService(model as never, tuktukService as never, deviceService as never);
  });

  it('rejects an empty ping array', async () => {
    await expect(
      service.ingest(tuktukId.toString(), deviceMongoId.toString(), []),
    ).rejects.toThrow('At least one ping is required');
  });

  it('rejects more than 500 pings in a single request', async () => {
    const tooMany = new Array(501).fill(validPing);
    await expect(
      service.ingest(tuktukId.toString(), deviceMongoId.toString(), tooMany),
    ).rejects.toThrow('Maximum 500 pings');
  });

  it("rejects a device trying to post for someone else's tuk-tuk", async () => {
    const otherDeviceId = new Types.ObjectId('670000000000000000000099').toString();
    await expect(
      service.ingest(tuktukId.toString(), otherDeviceId, [validPing]),
    ).rejects.toThrow(BadRequestException);
  });

  it('inserts pings denormalised with tuk-tuk scope ids', async () => {
    await service.ingest(tuktukId.toString(), deviceMongoId.toString(), [validPing]);
    expect(model.insertMany).toHaveBeenCalledTimes(1);
    const docs = model.insertMany.mock.calls[0][0];
    expect(docs).toHaveLength(1);
    expect(docs[0].provinceId).toBe(provinceId);
    expect(docs[0].location.coordinates).toEqual([validPing.lng, validPing.lat]);
  });

  it('updates the device lastSeenAt with the latest ping timestamp', async () => {
    await service.ingest(tuktukId.toString(), deviceMongoId.toString(), [validPing]);
    expect(deviceService.touchLastSeen).toHaveBeenCalledTimes(1);
    const [touchedId, when] = deviceService.touchLastSeen.mock.calls[0];
    expect(touchedId).toBe(deviceMongoId);
    expect(when).toEqual(new Date(validPing.recordedAt));
  });
});
