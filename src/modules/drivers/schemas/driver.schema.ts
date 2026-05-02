import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DriverDocument = HydratedDocument<Driver>;

@Schema({ timestamps: true, collection: 'drivers' })
export class Driver {
  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, trim: true })
  nicNumber!: string;

  @Prop({ required: true, unique: true, trim: true })
  licenseNumber!: string;

  @Prop({ trim: true })
  contactNumber?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
