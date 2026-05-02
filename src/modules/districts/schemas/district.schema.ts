import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DistrictDocument = HydratedDocument<District>;

@Schema({ timestamps: true, collection: 'districts' })
export class District {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Province', index: true })
  provinceId!: Types.ObjectId;
}

export const DistrictSchema = SchemaFactory.createForClass(District);
