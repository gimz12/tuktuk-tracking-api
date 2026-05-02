import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ example: 'K. M. Silva' })
  @IsString()
  @Length(2, 128)
  fullName!: string;

  @ApiProperty({ example: '199012345678' })
  @IsString()
  @Length(9, 16)
  nicNumber!: string;

  @ApiProperty({ example: 'B1234567' })
  @IsString()
  @Length(4, 16)
  licenseNumber!: string;

  @ApiPropertyOptional({ example: '+94771234567' })
  @IsOptional()
  @Matches(/^\+?[0-9\- ]{7,16}$/)
  contactNumber?: string;
}
