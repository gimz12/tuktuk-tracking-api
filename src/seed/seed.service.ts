import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { Province, ProvinceDocument } from '../modules/provinces/schemas/province.schema';
import { District, DistrictDocument } from '../modules/districts/schemas/district.schema';
import { Station, StationDocument } from '../modules/stations/schemas/station.schema';
import { Driver, DriverDocument } from '../modules/drivers/schemas/driver.schema';
import { Device, DeviceDocument } from '../modules/devices/schemas/device.schema';
import { Tuktuk, TuktukDocument, TuktukStatus } from '../modules/tuktuks/schemas/tuktuk.schema';
import { Ping, PingDocument } from '../modules/pings/schemas/ping.schema';
import { User, UserDocument } from '../modules/users/schemas/user.schema';
import { Role } from '../common/roles.enum';
import { PROVINCES, DISTRICTS, STATIONS } from './master-data';

const TUKTUK_COUNT = 200;
const HISTORY_DAYS = 7;
const PING_INTERVAL_MIN = 10;
const ACTIVE_HOUR_START = 6;  // 06:00 local
const ACTIVE_HOUR_END = 22;   // 22:00 local

interface SeedReport {
  provinces: number;
  districts: number;
  stations: number;
  drivers: number;
  devices: number;
  tuktuks: number;
  pings: number;
  users: number;
  deviceCredentials: Array<{ deviceId: string; deviceSecret: string }>;
}

@Injectable()
export class SeedService {
  private readonly log = new Logger('Seed');

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Province.name) private readonly provinceModel: Model<ProvinceDocument>,
    @InjectModel(District.name) private readonly districtModel: Model<DistrictDocument>,
    @InjectModel(Station.name)  private readonly stationModel:  Model<StationDocument>,
    @InjectModel(Driver.name)   private readonly driverModel:   Model<DriverDocument>,
    @InjectModel(Device.name)   private readonly deviceModel:   Model<DeviceDocument>,
    @InjectModel(Tuktuk.name)   private readonly tuktukModel:   Model<TuktukDocument>,
    @InjectModel(Ping.name)     private readonly pingModel:     Model<PingDocument>,
    @InjectModel(User.name)     private readonly userModel:     Model<UserDocument>,
  ) {}

  async run(reset = true): Promise<SeedReport> {
    if (reset) await this.reset();

    const provinces = await this.seedProvinces();
    const districts = await this.seedDistricts(provinces);
    const stations  = await this.seedStations(districts);
    const drivers   = await this.seedDrivers(TUKTUK_COUNT);
    const { devices, deviceCredentials } = await this.seedDevices(TUKTUK_COUNT);
    const tuktuks   = await this.seedTuktuks(drivers, devices, stations);
    const pings     = await this.seedPings(tuktuks);
    const users     = await this.seedUsers(provinces, districts, stations);

    const report: SeedReport = {
      provinces: provinces.size,
      districts: districts.size,
      stations: stations.size,
      drivers: drivers.length,
      devices: devices.length,
      tuktuks: tuktuks.length,
      pings,
      users,
      deviceCredentials,
    };
    this.log.log(`Seed complete: ${JSON.stringify({ ...report, deviceCredentials: '<redacted>' })}`);
    return report;
  }

  private async reset() {
    this.log.warn('Resetting all collections');
    await Promise.all([
      this.pingModel.deleteMany({}),
      this.tuktukModel.deleteMany({}),
      this.deviceModel.deleteMany({}),
      this.driverModel.deleteMany({}),
      this.stationModel.deleteMany({}),
      this.districtModel.deleteMany({}),
      this.provinceModel.deleteMany({}),
      this.userModel.deleteMany({}),
    ]);
  }

  private async seedProvinces() {
    const map = new Map<string, ProvinceDocument>();
    for (const p of PROVINCES) {
      const doc = await this.provinceModel.create({ code: p.code, name: p.name });
      map.set(p.code, doc);
    }
    return map;
  }

  private async seedDistricts(provinces: Map<string, ProvinceDocument>) {
    const map = new Map<string, DistrictDocument & { centreLat: number; centreLng: number }>();
    for (const d of DISTRICTS) {
      const province = provinces.get(d.provinceCode);
      if (!province) throw new Error(`Missing province ${d.provinceCode} for district ${d.code}`);
      const doc = await this.districtModel.create({
        code: d.code,
        name: d.name,
        provinceId: province._id,
      });
      map.set(d.code, Object.assign(doc, { centreLat: d.centreLat, centreLng: d.centreLng }));
    }
    return map;
  }

  private async seedStations(
    districts: Map<string, DistrictDocument & { centreLat: number; centreLng: number }>,
  ) {
    const map = new Map<string, StationDocument>();
    for (const s of STATIONS) {
      const district = districts.get(s.districtCode);
      if (!district) throw new Error(`Missing district ${s.districtCode} for station ${s.code}`);
      const doc = await this.stationModel.create({
        code: s.code,
        name: s.name,
        districtId: district._id,
        provinceId: district.provinceId,
        baseLatitude: s.baseLat,
        baseLongitude: s.baseLng,
      });
      map.set(s.code, doc);
    }
    return map;
  }

  private async seedDrivers(count: number) {
    const drivers: DriverDocument[] = [];
    const FIRST = ['Kasun', 'Niluka', 'Saman', 'Tharindu', 'Roshan', 'Dilshan', 'Anuradha', 'Lasith', 'Ishara', 'Hashini'];
    const LAST  = ['Perera', 'Silva', 'Fernando', 'Jayasuriya', 'Bandara', 'Rajapaksha', 'Wickramasinghe', 'Senanayake', 'Gunawardena', 'Karunaratne'];
    for (let i = 0; i < count; i++) {
      const fn = FIRST[i % FIRST.length];
      const ln = LAST[(i * 7) % LAST.length];
      drivers.push(
        await this.driverModel.create({
          fullName: `${fn} ${ln}`,
          nicNumber: `19${85 + (i % 20)}${String(10000 + i).slice(0, 7)}`,
          licenseNumber: `B${String(1000000 + i)}`,
          contactNumber: `+9477${String(1000000 + i).slice(0, 7)}`,
        }),
      );
    }
    return drivers;
  }

  private async seedDevices(count: number) {
    const devices: DeviceDocument[] = [];
    const deviceCredentials: Array<{ deviceId: string; deviceSecret: string }> = [];
    for (let i = 0; i < count; i++) {
      const deviceId = `DEV-${String(i + 1).padStart(6, '0')}`;
      const secret = `secret-${deviceId}-${Math.random().toString(36).slice(2, 10)}`;
      const secretHash = await bcrypt.hash(secret, 8);
      const doc = await this.deviceModel.create({
        deviceId,
        secretHash,
        hardwareModel: 'TT-Tracker v2',
        firmwareVersion: '1.4.2',
      });
      devices.push(doc);
      deviceCredentials.push({ deviceId, deviceSecret: secret });
    }
    return { devices, deviceCredentials };
  }

  private async seedTuktuks(
    drivers: DriverDocument[],
    devices: DeviceDocument[],
    stations: Map<string, StationDocument>,
  ) {
    const stationList = Array.from(stations.values());
    const tuktuks: TuktukDocument[] = [];
    for (let i = 0; i < drivers.length; i++) {
      const station = stationList[i % stationList.length];
      const provinceLetters = ['WP', 'CP', 'SP', 'NP', 'EP', 'NW', 'NC', 'UV', 'SG'][i % 9];
      const reg = `${provinceLetters}-AB-${String(1000 + i).padStart(4, '0')}`;
      const tuktuk = await this.tuktukModel.create({
        registrationNumber: reg,
        driverId: drivers[i]._id,
        deviceId: devices[i]._id,
        stationId: station._id,
        districtId: station.districtId,
        provinceId: station.provinceId,
        status: TuktukStatus.ACTIVE,
      });
      await this.deviceModel.updateOne(
        { _id: devices[i]._id },
        { $set: { tuktukId: tuktuk._id } },
      );
      tuktuks.push(tuktuk);
    }
    return tuktuks;
  }

  private async seedPings(tuktuks: TuktukDocument[]): Promise<number> {
    const now = new Date();
    const startMs = now.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000;

    let total = 0;
    const BATCH = 2000;
    let buffer: Array<Record<string, unknown>> = [];

    for (const tuktuk of tuktuks) {
      const station = await this.stationModel.findById(tuktuk.stationId).lean();
      if (!station) continue;
      const baseLat = station.baseLatitude ?? 7.0;
      const baseLng = station.baseLongitude ?? 80.0;

      const zoneJitterLat = (Math.random() - 0.5) * 0.04; // ~ ±2 km
      const zoneJitterLng = (Math.random() - 0.5) * 0.04;

      let lat = baseLat + zoneJitterLat;
      let lng = baseLng + zoneJitterLng;
      let heading = Math.random() * 360;

      for (let day = 0; day < HISTORY_DAYS; day++) {
        for (let hour = ACTIVE_HOUR_START; hour < ACTIVE_HOUR_END; hour++) {
          for (let m = 0; m < 60; m += PING_INTERVAL_MIN) {
            const ts = new Date(startMs + day * 86_400_000 + hour * 3_600_000 + m * 60_000);

            heading = (heading + (Math.random() - 0.5) * 30 + 360) % 360;
            const stepKm = 0.05 + Math.random() * 0.15;
            const stepDeg = stepKm / 111;
            lat += Math.cos((heading * Math.PI) / 180) * stepDeg;
            lng += Math.sin((heading * Math.PI) / 180) * stepDeg / Math.cos((baseLat * Math.PI) / 180);

            const dLat = lat - (baseLat + zoneJitterLat);
            const dLng = lng - (baseLng + zoneJitterLng);
            if (dLat * dLat + dLng * dLng > 0.01) {
              lat -= dLat * 0.1;
              lng -= dLng * 0.1;
            }

            buffer.push({
              tuktukId: tuktuk._id,
              deviceId: tuktuk.deviceId,
              stationId: tuktuk.stationId,
              districtId: tuktuk.districtId,
              provinceId: tuktuk.provinceId,
              location: { type: 'Point', coordinates: [lng, lat] },
              recordedAt: ts,
              speedKph: Math.round(15 + Math.random() * 40),
              headingDeg: Math.round(heading),
              accuracyMeters: 5 + Math.round(Math.random() * 10),
            });

            if (buffer.length >= BATCH) {
              await this.pingModel.insertMany(buffer, { ordered: false });
              total += buffer.length;
              buffer = [];
            }
          }
        }
      }
    }

    if (buffer.length > 0) {
      await this.pingModel.insertMany(buffer, { ordered: false });
      total += buffer.length;
    }
    return total;
  }

  private async seedUsers(
    provinces: Map<string, ProvinceDocument>,
    districts: Map<string, DistrictDocument & { centreLat: number; centreLng: number }>,
    stations: Map<string, StationDocument>,
  ): Promise<number> {
    const adminEmail = this.config.get<string>('BOOTSTRAP_ADMIN_EMAIL') ?? 'admin@police.gov.lk';
    const adminPwd   = this.config.get<string>('BOOTSTRAP_ADMIN_PASSWORD') ?? 'ChangeMe!Admin#2026';

    const make = async (
      email: string,
      password: string,
      fullName: string,
      role: Role,
      scope: { provinceId?: Types.ObjectId; districtId?: Types.ObjectId; stationId?: Types.ObjectId } = {},
    ) => {
      const passwordHash = await bcrypt.hash(password, 10);
      await this.userModel.create({
        email,
        passwordHash,
        fullName,
        role,
        provinceId: scope.provinceId ?? null,
        districtId: scope.districtId ?? null,
        stationId: scope.stationId ?? null,
      });
    };

    let count = 0;
    await make(adminEmail, adminPwd, 'HQ Administrator', Role.ADMIN);
    count++;

    const wp = provinces.get('WP');
    if (wp) {
      await make('province.wp@police.gov.lk', 'Province#WP2026', 'Western Province Admin', Role.PROVINCE_ADMIN, {
        provinceId: wp._id,
      });
      count++;
    }

    const colFort = stations.get('COL-FORT');
    const colDistrict = districts.get('COL');
    if (colFort && colDistrict) {
      await make('officer.colfort@police.gov.lk', 'Officer#Col2026', 'Officer - Colombo Fort', Role.STATION_OFFICER, {
        provinceId: colFort.provinceId,
        districtId: colDistrict._id,
        stationId: colFort._id,
      });
      count++;
    }

    return count;
  }
}
