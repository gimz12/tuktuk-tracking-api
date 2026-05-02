import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { LiveLocationsQueryDto } from './dto/live-locations.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { TuktuksService } from '../tuktuks/tuktuks.service';
import { PingsService } from '../pings/pings.service';

@ApiTags('locations')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationService: LocationsService,
    private readonly tuktukService: TuktuksService,
    private readonly pingService: PingsService,
  ) {}

  @Get('live')
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({
    summary: 'Live view: latest ping per tuk-tuk in the caller’s scope',
  })
  live(
    @CurrentUser() user: AuthenticatedUser,
    @Query() dto: LiveLocationsQueryDto,
  ) {
    return this.locationService.live(user, dto);
  }

  @Get('history')
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({
    summary: 'Aggregate historical pings for a province/district/station window',
  })
  history(
    @CurrentUser() user: AuthenticatedUser,
    @Query() dto: HistoryQueryDto,
    @Query('provinceId') provinceId?: string,
    @Query('districtId') districtId?: string,
    @Query('stationId') stationId?: string,
  ) {
    return this.locationService.history(
      user,
      { provinceId, districtId, stationId },
      dto,
    );
  }

  @Get('tuktuks/:id/last')
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({ summary: 'Last-known location of a single tuk-tuk' })
  async last(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.tuktukService.assertVisibleTo(user, id);
    const ping = await this.pingService.lastForTuktuk(id);
    if (!ping) throw new NotFoundException('No pings recorded for this tuk-tuk');
    return ping;
  }

  @Get('tuktuks/:id/history')
  @Roles(Role.ADMIN, Role.PROVINCE_ADMIN, Role.STATION_OFFICER)
  @ApiOperation({ summary: 'Movement history for a single tuk-tuk in a time window' })
  async historyOfOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query() dto: HistoryQueryDto,
  ) {
    await this.tuktukService.assertVisibleTo(user, id);
    const items = await this.pingService.historyForTuktuk(
      id,
      new Date(dto.from),
      new Date(dto.to),
      dto.limit,
    );
    return { tuktukId: id, count: items.length, items };
  }
}
