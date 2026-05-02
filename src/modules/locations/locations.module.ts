import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { PingsModule } from '../pings/pings.module';
import { TuktuksModule } from '../tuktuks/tuktuks.module';

@Module({
  imports: [PingsModule, TuktuksModule],
  providers: [LocationsService],
  controllers: [LocationsController],
})
export class LocationsModule {}
