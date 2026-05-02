import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StationDocument = HydratedDocument<Station>;

@Schema({ timestamps: true, collection: 'stations' })
export class Station {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'District', index: true })
  districtId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Province', index: true })
  provinceId!: Types.ObjectId;

  @Prop({ type: Number })
  baseLatitude?: number;

  @Prop({ type: Number })
  baseLongitude?: number;
}

export const StationSchema = SchemaFactory.createForClass(Station);
