import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProvincesService } from './provinces.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('provinces')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('provinces')
export class ProvincesController {
  constructor(private readonly service: ProvincesService) {}

  @Get()
  @ApiOperation({ summary: 'List all provinces' })
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single province' })
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a province (admin only)' })
  create(@Body() dto: CreateProvinceDto) {
    return this.service.create(dto);
  }
}
