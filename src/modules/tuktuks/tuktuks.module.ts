import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tuktuk, TuktukSchema } from './schemas/tuktuk.schema';
import { TuktuksService } from './tuktuks.service';
import { TuktuksController } from './tuktuks.controller';
import { DriversModule } from '../drivers/drivers.module';
import { DevicesModule } from '../devices/devices.module';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tuktuk.name, schema: TuktukSchema }]),
    DriversModule,
    DevicesModule,
    StationsModule,
  ],
  providers: [TuktuksService],
  controllers: [TuktuksController],
  exports: [TuktuksService, MongooseModule],
})
export class TuktuksModule {}
