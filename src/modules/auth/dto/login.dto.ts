import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@police.gov.lk' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ChangeMe!Admin#2026' })
  @IsString()
  @MinLength(8)
  password!: string;
}
