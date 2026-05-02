import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, Length } from 'class-validator';

export class CreateDistrictDto {
  @ApiProperty({ example: 'COL' })
  @IsString()
  @Length(2, 8)
  code!: string;

  @ApiProperty({ example: 'Colombo' })
  @IsString()
  @Length(2, 64)
  name!: string;

  @ApiProperty({ example: '6700f0a1b2c3d4e5f6a7b8c9' })
  @IsMongoId()
  provinceId!: string;
}
