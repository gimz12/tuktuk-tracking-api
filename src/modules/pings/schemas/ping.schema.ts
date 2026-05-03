import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PingDocument = HydratedDocument<Ping>;

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point', required: true })
  type!: 'Point';

  @Prop({ type: [Number], required: true })
  coordinates!: [number, number]; // [lng, lat]
}
export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'pings',
})
export class Ping {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tuktuk', index: true })
  tuktukId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Device' })
  deviceId!: Types.ObjectId;

  // denormalised refs — copied from the parent tuk-tuk so scope queries
  // don't need a join across collections
  @Prop({ required: true, type: Types.ObjectId, ref: 'Station', index: true })
  stationId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'District', index: true })
  districtId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Province', index: true })
  provinceId!: Types.ObjectId;

  @Prop({ required: true, type: GeoPointSchema })
  location!: GeoPoint;

  @Prop({ required: true, type: Date, index: true })
  recordedAt!: Date;

  @Prop({ type: Number, min: 0, max: 300 })
  speedKph?: number;

  @Prop({ type: Number, min: 0, max: 360 })
  headingDeg?: number;

  @Prop({ type: Number })
  accuracyMeters?: number;
}

export const PingSchema = SchemaFactory.createForClass(Ping);

// compound indexes for time-window queries by scope
PingSchema.index({ tuktukId: 1, recordedAt: -1 });
PingSchema.index({ stationId: 1, recordedAt: -1 });
PingSchema.index({ districtId: 1, recordedAt: -1 });
PingSchema.index({ provinceId: 1, recordedAt: -1 });
// geospatial index — required for $near / $geoWithin queries
PingSchema.index({ location: '2dsphere' });
