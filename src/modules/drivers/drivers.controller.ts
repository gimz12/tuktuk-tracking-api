import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('drivers')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly service: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'List drivers' })
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single driver' })
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({ summary: 'Register a new driver' })
  create(@Body() dto: CreateDriverDto) {
    return this.service.create(dto);
  }
}
