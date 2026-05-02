import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ping, PingSchema } from './schemas/ping.schema';
import { PingsService } from './pings.service';
import { PingsController } from './pings.controller';
import { TuktuksModule } from '../tuktuks/tuktuks.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ping.name, schema: PingSchema }]),
    TuktuksModule,
    DevicesModule,
  ],
  providers: [PingsService],
  controllers: [PingsController],
  exports: [PingsService, MongooseModule],
})
export class PingsModule {}
