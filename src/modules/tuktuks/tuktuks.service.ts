import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Tuktuk, TuktukDocument } from './schemas/tuktuk.schema';
import { RegisterTuktukDto } from './dto/register-tuktuk.dto';
import { ListTuktuksDto } from './dto/list-tuktuks.dto';
import { DriversService } from '../drivers/drivers.service';
import { DevicesService } from '../devices/devices.service';
import { StationsService } from '../stations/stations.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/roles.enum';

@Injectable()
export class TuktuksService {
  constructor(
    @InjectModel(Tuktuk.name) private readonly model: Model<TuktukDocument>,
    private readonly drivers: DriversService,
    private readonly devices: DevicesService,
    private readonly stations: StationsService,
  ) {}

  async register(dto: RegisterTuktukDto) {
    await this.drivers.findById(dto.driverId);
    const device = await this.devices.findById(dto.deviceId);
    const station = await this.stations.findById(dto.stationId);

    const reg = dto.registrationNumber.toUpperCase();
    const dup = await this.model.findOne({
      $or: [
        { registrationNumber: reg },
        { deviceId: new Types.ObjectId(dto.deviceId) },
      ],
    });
    if (dup) {
      throw new ConflictException(
        'Tuk-tuk with that registration or device already exists',
      );
    }

    const tuktuk = await this.model.create({
      registrationNumber: reg,
      driverId: new Types.ObjectId(dto.driverId),
      deviceId: device._id,
      stationId: station._id,
      districtId: station.districtId,
      provinceId: station.provinceId,
    });

    await this.devices.assignToTuktuk(device.deviceId, tuktuk._id);
    return tuktuk;
  }

  buildScopedFilter(
    user: AuthenticatedUser,
    extra: ListTuktuksDto = {},
  ): FilterQuery<TuktukDocument> {
    const filter: FilterQuery<TuktukDocument> = {};

    if (user.role === Role.PROVINCE_ADMIN) {
      if (!user.provinceId) throw new BadRequestException('Province scope missing');
      filter.provinceId = new Types.ObjectId(user.provinceId);
    } else if (user.role === Role.STATION_OFFICER) {
      if (!user.stationId) throw new BadRequestException('Station scope missing');
      filter.stationId = new Types.ObjectId(user.stationId);
    }

    if (extra.provinceId) {
      if (filter.provinceId && filter.provinceId.toString() !== extra.provinceId) {
        throw new BadRequestException('Out-of-scope provinceId');
      }
      filter.provinceId = new Types.ObjectId(extra.provinceId);
    }
    if (extra.districtId) {
      filter.districtId = new Types.ObjectId(extra.districtId);
    }
    if (extra.stationId) {
      if (filter.stationId && filter.stationId.toString() !== extra.stationId) {
        throw new BadRequestException('Out-of-scope stationId');
      }
      filter.stationId = new Types.ObjectId(extra.stationId);
    }
    if (extra.status) filter.status = extra.status;
    return filter;
  }

  async list(user: AuthenticatedUser, dto: ListTuktuksDto) {
    const filter = this.buildScopedFilter(user, dto);
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .skip(dto.skip ?? 0)
        .limit(dto.limit ?? 50)
        .sort({ registrationNumber: 1 }),
      this.model.countDocuments(filter),
    ]);
    return { total, count: items.length, items };
  }

  async findById(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Tuk-tuk not found');
    return doc;
  }

  async assertVisibleTo(user: AuthenticatedUser, id: string) {
    const tuktuk = await this.findById(id);
    if (user.role === Role.ADMIN) return tuktuk;
    if (user.role === Role.PROVINCE_ADMIN) {
      if (tuktuk.provinceId.toString() !== user.provinceId) {
        throw new NotFoundException('Tuk-tuk not found');
      }
    }
    if (user.role === Role.STATION_OFFICER) {
      if (tuktuk.stationId.toString() !== user.stationId) {
        throw new NotFoundException('Tuk-tuk not found');
      }
    }
    if (user.role === Role.DEVICE) {
      if (tuktuk._id.toString() !== user.tuktukId) {
        throw new NotFoundException('Tuk-tuk not found');
      }
    }
    return tuktuk;
  }
}
