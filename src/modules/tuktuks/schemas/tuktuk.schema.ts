import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TuktukDocument = HydratedDocument<Tuktuk>;

export enum TuktukStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  RETIRED = 'retired',
}

@Schema({ timestamps: true, collection: 'tuktuks' })
export class Tuktuk {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  registrationNumber!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Driver' })
  driverId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Device', unique: true })
  deviceId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Station', index: true })
  stationId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'District', index: true })
  districtId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Province', index: true })
  provinceId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(TuktukStatus),
    default: TuktukStatus.ACTIVE,
    type: String,
  })
  status!: TuktukStatus;
}

export const TuktukSchema = SchemaFactory.createForClass(Tuktuk);
