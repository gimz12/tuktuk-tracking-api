import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('stations')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stations')
export class StationsController {
  constructor(private readonly service: StationsService) {}

  @Get()
  @ApiQuery({ name: 'provinceId', required: false })
  @ApiQuery({ name: 'districtId', required: false })
  @ApiOperation({ summary: 'List stations (optionally filtered by province / district)' })
  list(
    @Query('provinceId') provinceId?: string,
    @Query('districtId') districtId?: string,
  ) {
    return this.service.findAll({ provinceId, districtId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a station' })
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN)
  @ApiOperation({ summary: 'Create a station' })
  create(@Body() dto: CreateStationDto) {
    return this.service.create(dto);
  }
}
