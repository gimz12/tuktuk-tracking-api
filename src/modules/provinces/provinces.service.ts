import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Province, ProvinceDocument } from './schemas/province.schema';
import { CreateProvinceDto } from './dto/create-province.dto';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectModel(Province.name) private readonly model: Model<ProvinceDocument>,
  ) {}

  async create(dto: CreateProvinceDto) {
    const code = dto.code.toUpperCase();
    const existing = await this.model.findOne({ code });
    if (existing) throw new ConflictException(`Province ${code} already exists`);
    return this.model.create({ ...dto, code });
  }

  async findAll() {
    return this.model.find().sort({ name: 1 });
  }

  async findById(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Province not found');
    return doc;
  }

  async findByCode(code: string) {
    return this.model.findOne({ code: code.toUpperCase() });
  }

  async upsertByCode(code: string, name: string) {
    return this.model.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $setOnInsert: { code: code.toUpperCase(), name } },
      { upsert: true, new: true },
    );
  }
}
