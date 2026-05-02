import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('devices')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly service: DevicesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN)
  @ApiOperation({ summary: 'List all tracking devices' })
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({ summary: 'Get a single device' })
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Register a new tracking device. Secret is stored hashed; keep your copy safe.',
  })
  register(@Body() dto: RegisterDeviceDto) {
    return this.service.register(dto);
  }
}
