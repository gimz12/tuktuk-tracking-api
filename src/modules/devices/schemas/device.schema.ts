import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ timestamps: true, collection: 'devices' })
export class Device {
  @Prop({ required: true, unique: true, trim: true, index: true })
  deviceId!: string;

  @Prop({ required: true })
  secretHash!: string;

  @Prop({ type: Types.ObjectId, ref: 'Tuktuk', default: null, index: true })
  tuktukId!: Types.ObjectId | null;

  @Prop({ trim: true })
  hardwareModel?: string;

  @Prop({ trim: true })
  firmwareVersion?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: null })
  lastSeenAt!: Date | null;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
