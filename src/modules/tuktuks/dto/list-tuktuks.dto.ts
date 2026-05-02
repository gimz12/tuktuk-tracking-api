import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';
import { TuktukStatus } from '../schemas/tuktuk.schema';

export class ListTuktuksDto {
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

  @ApiPropertyOptional({ enum: TuktukStatus })
  @IsOptional()
  @IsEnum(TuktukStatus)
  status?: TuktukStatus;

  @ApiPropertyOptional({ default: 50, maximum: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;
}
