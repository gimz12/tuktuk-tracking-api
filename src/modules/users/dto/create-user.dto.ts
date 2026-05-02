import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role, USER_ROLES } from '../../../common/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'officer.colombo@police.gov.lk' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass#2026', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Sub Inspector A. Perera' })
  @IsString()
  fullName!: string;

  @ApiProperty({ enum: USER_ROLES, example: Role.STATION_OFFICER })
  @IsEnum(USER_ROLES)
  role!: Role;

  @ApiPropertyOptional({ description: 'Required for province_admin' })
  @IsOptional()
  @IsMongoId()
  provinceId?: string;

  @ApiPropertyOptional({ description: 'Required for station_officer (along with stationId)' })
  @IsOptional()
  @IsMongoId()
  districtId?: string;

  @ApiPropertyOptional({ description: 'Required for station_officer' })
  @IsOptional()
  @IsMongoId()
  stationId?: string;
}
