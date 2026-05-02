import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateStationDto {
  @ApiProperty({ example: 'COL-001' })
  @IsString()
  @Length(2, 16)
  code!: string;

  @ApiProperty({ example: 'Colombo Fort Police Station' })
  @IsString()
  @Length(2, 128)
  name!: string;

  @ApiProperty()
  @IsMongoId()
  districtId!: string;

  @ApiPropertyOptional({ example: 6.9344 })
  @IsOptional()
  @IsLatitude()
  baseLatitude?: number;

  @ApiPropertyOptional({ example: 79.8428 })
  @IsOptional()
  @IsLongitude()
  baseLongitude?: number;
}
