import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Device, DeviceDocument } from './schemas/device.schema';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private readonly model: Model<DeviceDocument>,
  ) {}

  async register(dto: RegisterDeviceDto) {
    const existing = await this.model.findOne({ deviceId: dto.deviceId });
    if (existing) throw new ConflictException(`Device ${dto.deviceId} already registered`);
    // cost factor 10 — recommended balance between brute-force resistance
    // and runtime cost for an interactive endpoint
    const secretHash = await bcrypt.hash(dto.deviceSecret, 10);
    const created = await this.model.create({
      deviceId: dto.deviceId,
      secretHash,
      hardwareModel: dto.hardwareModel,
      firmwareVersion: dto.firmwareVersion,
    });
    return {
      id: created._id.toString(),
      deviceId: created.deviceId,
      hardwareModel: created.hardwareModel,
      firmwareVersion: created.firmwareVersion,
      tuktukId: created.tuktukId?.toString() ?? null,
      isActive: created.isActive,
    };
  }

  async findAll(limit = 200) {
    return this.model
      .find()
      .select('-secretHash')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async findById(id: string) {
    const doc = await this.model.findById(id).select('-secretHash');
    if (!doc) throw new NotFoundException('Device not found');
    return doc;
  }

  async findByDeviceId(deviceId: string) {
    return this.model.findOne({ deviceId });
  }

  async assignToTuktuk(deviceId: string, tuktukId: Types.ObjectId) {
    const updated = await this.model.findOneAndUpdate(
      { deviceId },
      { $set: { tuktukId } },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Device not found');
    return updated;
  }

  async verifySecret(deviceId: string, secret: string): Promise<DeviceDocument | null> {
    const device = await this.model.findOne({ deviceId });
    if (!device || !device.isActive) return null;
    const ok = await bcrypt.compare(secret, device.secretHash);
    return ok ? device : null;
  }

  async touchLastSeen(id: Types.ObjectId, when: Date) {
    await this.model.updateOne({ _id: id }, { $set: { lastSeenAt: when } });
  }
}
