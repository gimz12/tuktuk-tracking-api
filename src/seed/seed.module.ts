import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';

import { Province, ProvinceSchema } from '../modules/provinces/schemas/province.schema';
import { District, DistrictSchema } from '../modules/districts/schemas/district.schema';
import { Station, StationSchema } from '../modules/stations/schemas/station.schema';
import { Driver, DriverSchema } from '../modules/drivers/schemas/driver.schema';
import { Device, DeviceSchema } from '../modules/devices/schemas/device.schema';
import { Tuktuk, TuktukSchema } from '../modules/tuktuks/schemas/tuktuk.schema';
import { Ping, PingSchema } from '../modules/pings/schemas/ping.schema';
import { User, UserSchema } from '../modules/users/schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Province.name, schema: ProvinceSchema },
      { name: District.name, schema: DistrictSchema },
      { name: Station.name,  schema: StationSchema },
      { name: Driver.name,   schema: DriverSchema },
      { name: Device.name,   schema: DeviceSchema },
      { name: Tuktuk.name,   schema: TuktukSchema },
      { name: Ping.name,     schema: PingSchema },
      { name: User.name,     schema: UserSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
