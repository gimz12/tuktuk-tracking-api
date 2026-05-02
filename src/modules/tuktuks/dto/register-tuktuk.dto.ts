import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, Matches } from 'class-validator';

export class RegisterTuktukDto {
  @ApiProperty({ example: 'WP-AB-1234' })
  @IsString()
  @Matches(/^[A-Z]{2,3}-[A-Z]{1,3}-[0-9]{3,4}$/, {
    message: 'registrationNumber must look like WP-AB-1234',
  })
  registrationNumber!: string;

  @ApiProperty()
  @IsMongoId()
  driverId!: string;

  @ApiProperty({ description: 'Mongo _id of the registered Device document' })
  @IsMongoId()
  deviceId!: string;

  @ApiProperty()
  @IsMongoId()
  stationId!: string;
}
