import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeviceTokenDto {
  @ApiProperty({ example: 'DEV-000123', description: 'Device hardware ID' })
  @IsString()
  deviceId!: string;

  @ApiProperty({
    example: 'super-secret-device-key',
    description: 'Pre-shared device secret issued at registration',
  })
  @IsString()
  @MinLength(8)
  deviceSecret!: string;
}
