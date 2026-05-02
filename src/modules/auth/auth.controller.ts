import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { DeviceTokenDto } from './dto/device-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login (admin / province admin / station officer)' })
  login(@Body() dto: LoginDto) {
    return this.auth.loginUser(dto.email, dto.password);
  }

  @Public()
  @Post('device-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange device credentials for a device JWT' })
  deviceToken(@Body() dto: DeviceTokenDto) {
    return this.auth.issueDeviceToken(dto.deviceId, dto.deviceSecret);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('user-jwt')
  @Get('me')
  @ApiOperation({ summary: 'Return the currently authenticated user' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
