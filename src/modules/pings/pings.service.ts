import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ping, PingDocument } from './schemas/ping.schema';
import { PingPayloadDto } from './dto/create-ping.dto';
import { TuktuksService } from '../tuktuks/tuktuks.service';
import { DevicesService } from '../devices/devices.service';

export interface IngestedPing {
  tuktukId: Types.ObjectId;
  deviceId: Types.ObjectId;
  stationId: Types.ObjectId;
  districtId: Types.ObjectId;
  provinceId: Types.ObjectId;
  location: { type: 'Point'; coordinates: [number, number] };
  recordedAt: Date;
  speedKph?: number;
  headingDeg?: number;
  accuracyMeters?: number;
}

@Injectable()
export class PingsService {
  constructor(
    @InjectModel(Ping.name) private readonly model: Model<PingDocument>,
    private readonly tuktuks: TuktuksService,
    private readonly devices: DevicesService,
  ) {}

  async ingest(
    tuktukId: string,
    deviceId: string,
    payloads: PingPayloadDto[],
  ) {
    if (payloads.length === 0) {
      throw new BadRequestException('At least one ping is required');
    }
    if (payloads.length > 500) {
      throw new BadRequestException('Maximum 500 pings per request');
    }

    const tuktuk = await this.tuktuks.findById(tuktukId);
    if (tuktuk.deviceId.toString() !== deviceId) {
      throw new BadRequestException('Device is not bonded to this tuk-tuk');
    }

    const docs: IngestedPing[] = payloads.map((p) => ({
      tuktukId: tuktuk._id,
      deviceId: tuktuk.deviceId,
      stationId: tuktuk.stationId,
      districtId: tuktuk.districtId,
      provinceId: tuktuk.provinceId,
      location: { type: 'Point', coordinates: [p.lng, p.lat] },
      recordedAt: new Date(p.recordedAt),
      speedKph: p.speedKph,
      headingDeg: p.headingDeg,
      accuracyMeters: p.accuracyMeters,
    }));

    const inserted = await this.model.insertMany(docs, { ordered: false });
    const latest = docs.reduce((acc, d) =>
      acc.recordedAt > d.recordedAt ? acc : d,
    );
    await this.devices.touchLastSeen(tuktuk.deviceId, latest.recordedAt);
    return { accepted: inserted.length };
  }

  async bulkInsertRaw(rows: IngestedPing[]) {
    if (rows.length === 0) return { accepted: 0 };
    await this.model.insertMany(rows, { ordered: false });
    return { accepted: rows.length };
  }

  async lastForTuktuk(tuktukId: string) {
    return this.model
      .findOne({ tuktukId: new Types.ObjectId(tuktukId) })
      .sort({ recordedAt: -1 });
  }

  async historyForTuktuk(
    tuktukId: string,
    from: Date,
    to: Date,
    limit = 1000,
  ) {
    return this.model
      .find({
        tuktukId: new Types.ObjectId(tuktukId),
        recordedAt: { $gte: from, $lte: to },
      })
      .sort({ recordedAt: 1 })
      .limit(limit);
  }
}
