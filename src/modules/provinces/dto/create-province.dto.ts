import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateProvinceDto {
  @ApiProperty({ example: 'WP', description: 'Short code (e.g. WP, CP, NP)' })
  @IsString()
  @Length(2, 8)
  code!: string;

  @ApiProperty({ example: 'Western Province' })
  @IsString()
  @Length(2, 64)
  name!: string;
}
