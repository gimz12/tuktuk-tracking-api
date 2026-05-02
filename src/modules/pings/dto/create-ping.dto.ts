import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class PingPayloadDto {
  @ApiProperty({ example: 6.9344 })
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: 79.8428 })
  @IsLongitude()
  lng!: number;

  @ApiProperty({
    example: '2026-04-29T08:30:00.000Z',
    description: 'ISO timestamp of when the device captured the fix',
  })
  @IsDateString()
  recordedAt!: string;

  @ApiPropertyOptional({ example: 35.4 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  speedKph?: number;

  @ApiPropertyOptional({ example: 142 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  headingDeg?: number;

  @ApiPropertyOptional({ example: 7.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracyMeters?: number;
}

export class BulkPingDto {
  @ApiProperty({ type: [PingPayloadDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PingPayloadDto)
  pings!: PingPayloadDto[];
}
