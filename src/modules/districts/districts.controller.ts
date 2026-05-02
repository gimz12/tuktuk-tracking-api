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
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';

@ApiTags('districts')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtService: DistrictsService) {}

  @Get()
  @ApiQuery({ name: 'provinceId', required: false })
  @ApiOperation({ summary: 'List districts (optionally filtered by province)' })
  list(@Query('provinceId') provinceId?: string) {
    return this.districtService.findAll(provinceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single district' })
  get(@Param('id') id: string) {
    return this.districtService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a district (admin only)' })
  create(@Body() dto: CreateDistrictDto) {
    return this.districtService.create(dto);
  }
}
