import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TuktuksService } from './tuktuks.service';
import { RegisterTuktukDto } from './dto/register-tuktuk.dto';
import { ListTuktuksDto } from './dto/list-tuktuks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';

@ApiTags('tuktuks')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tuktuks')
export class TuktuksController {
  constructor(private readonly service: TuktuksService) {}

  @Get()
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({ summary: 'List tuk-tuks within the caller’s scope' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() dto: ListTuktuksDto,
  ) {
    return this.service.list(user, dto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({ summary: 'Get a tuk-tuk by id (must be in caller’s scope)' })
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.service.assertVisibleTo(user, id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({ summary: 'Register a tuk-tuk (binds driver + device + station)' })
  register(@Body() dto: RegisterTuktukDto) {
    return this.service.register(dto);
  }
}
