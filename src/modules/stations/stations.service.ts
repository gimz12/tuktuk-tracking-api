import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Station, StationDocument } from './schemas/station.schema';
import { CreateStationDto } from './dto/create-station.dto';
import { DistrictsService } from '../districts/districts.service';

export interface StationFilter {
  provinceId?: string;
  districtId?: string;
}

@Injectable()
export class StationsService {
  constructor(
    @InjectModel(Station.name) private readonly model: Model<StationDocument>,
    private readonly districts: DistrictsService,
  ) {}

  async create(dto: CreateStationDto) {
    const district = await this.districts.findById(dto.districtId);
    const code = dto.code.toUpperCase();
    const existing = await this.model.findOne({ code });
    if (existing) throw new ConflictException(`Station ${code} already exists`);
    return this.model.create({
      ...dto,
      code,
      districtId: district._id,
      provinceId: district.provinceId,
    });
  }

  async findAll(filter: StationFilter = {}) {
    const query: Record<string, unknown> = {};
    if (filter.provinceId) query.provinceId = new Types.ObjectId(filter.provinceId);
    if (filter.districtId) query.districtId = new Types.ObjectId(filter.districtId);
    return this.model.find(query).sort({ name: 1 });
  }

  async findById(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Station not found');
    return doc;
  }

  async upsertByCode(
    code: string,
    name: string,
    districtId: Types.ObjectId,
    provinceId: Types.ObjectId,
    baseLat?: number,
    baseLng?: number,
  ) {
    return this.model.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        $setOnInsert: {
          code: code.toUpperCase(),
          name,
          districtId,
          provinceId,
          baseLatitude: baseLat,
          baseLongitude: baseLng,
        },
      },
      { upsert: true, new: true },
    );
  }
}
