import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role, USER_ROLES } from '../../../common/roles.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, enum: USER_ROLES, type: String })
  role!: Role;

  @Prop({ type: Types.ObjectId, ref: 'Province', default: null })
  provinceId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'District', default: null })
  districtId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Station', default: null })
  stationId!: Types.ObjectId | null;

  @Prop({ default: true })
  isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
