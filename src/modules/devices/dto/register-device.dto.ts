import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({ example: 'DEV-000123' })
  @IsString()
  @Length(3, 32)
  deviceId!: string;

  @ApiProperty({
    example: 'super-secret-device-key',
    description: 'Pre-shared secret. Stored hashed; returned ONLY at registration time.',
  })
  @IsString()
  @Length(8, 128)
  deviceSecret!: string;

  @ApiPropertyOptional({ example: 'TT-Tracker v2' })
  @IsOptional()
  @IsString()
  hardwareModel?: string;

  @ApiPropertyOptional({ example: '1.4.2' })
  @IsOptional()
  @IsString()
  firmwareVersion?: string;
}
