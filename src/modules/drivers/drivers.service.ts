import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverDocument } from './schemas/driver.schema';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver.name) private readonly model: Model<DriverDocument>,
  ) {}

  async create(dto: CreateDriverDto) {
    const dup = await this.model.findOne({
      $or: [{ nicNumber: dto.nicNumber }, { licenseNumber: dto.licenseNumber }],
    });
    if (dup) throw new ConflictException('Driver NIC or licence already registered');
    return this.model.create(dto);
  }

  async findAll(limit = 200) {
    return this.model.find().sort({ createdAt: -1 }).limit(limit);
  }

  async findById(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Driver not found');
    return doc;
  }

  async findByNic(nic: string) {
    return this.model.findOne({ nicNumber: nic });
  }
}
