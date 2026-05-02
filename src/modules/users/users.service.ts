import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../../common/roles.enum';

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  provinceId?: string | null;
  districtId?: string | null;
  stationId?: string | null;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  async create(input: CreateUserInput): Promise<UserDocument> {
    const existing = await this.model.findOne({ email: input.email.toLowerCase() }).lean();
    if (existing) {
      throw new ConflictException(`User with email ${input.email} already exists`);
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.model.create({
      email: input.email.toLowerCase(),
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      provinceId: input.provinceId ? new Types.ObjectId(input.provinceId) : null,
      districtId: input.districtId ? new Types.ObjectId(input.districtId) : null,
      stationId: input.stationId ? new Types.ObjectId(input.stationId) : null,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.model.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async listAll(): Promise<UserDocument[]> {
    return this.model.find().sort({ createdAt: -1 }).limit(500);
  }

  async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async ensureBootstrapAdmin(email: string, password: string, fullName = 'System Admin'): Promise<UserDocument> {
    const existing = await this.findByEmail(email);
    if (existing) return existing;
    return this.create({ email, password, fullName, role: Role.ADMIN });
  }
}
