import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { District, DistrictDocument } from './schemas/district.schema';
import { CreateDistrictDto } from './dto/create-district.dto';
import { ProvincesService } from '../provinces/provinces.service';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectModel(District.name) private readonly model: Model<DistrictDocument>,
    private readonly provinceService: ProvincesService,
  ) {}

  async create(dto: CreateDistrictDto) {
    await this.provinceService.findById(dto.provinceId);
    const code = dto.code.toUpperCase();
    const existing = await this.model.findOne({ code });
    if (existing) throw new ConflictException(`District ${code} already exists`);
    return this.model.create({
      ...dto,
      code,
      provinceId: new Types.ObjectId(dto.provinceId),
    });
  }

  async findAll(provinceId?: string) {
    const filter = provinceId ? { provinceId: new Types.ObjectId(provinceId) } : {};
    return this.model.find(filter).sort({ name: 1 });
  }

  async findById(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('District not found');
    return doc;
  }

  async findByCode(code: string) {
    return this.model.findOne({ code: code.toUpperCase() });
  }

  async upsertByCode(code: string, name: string, provinceId: Types.ObjectId) {
    return this.model.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $setOnInsert: { code: code.toUpperCase(), name, provinceId } },
      { upsert: true, new: true },
    );
  }
}
