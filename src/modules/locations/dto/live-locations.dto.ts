import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class LiveLocationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  districtId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  stationId?: string;

  @ApiPropertyOptional({
    default: 30,
    description:
      'Look back this many minutes when finding the most-recent ping per vehicle',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  windowMinutes?: number = 30;

  @ApiPropertyOptional({ default: 500, maximum: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  limit?: number = 500;
}
