import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { District, DistrictSchema } from './schemas/district.schema';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { ProvincesModule } from '../provinces/provinces.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }]),
    ProvincesModule,
  ],
  providers: [DistrictsService],
  controllers: [DistrictsController],
  exports: [DistrictsService, MongooseModule],
})
export class DistrictsModule {}
