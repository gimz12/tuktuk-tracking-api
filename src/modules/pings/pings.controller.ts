import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PingsService } from './pings.service';
import { BulkPingDto, PingPayloadDto } from './dto/create-ping.dto';
import { DeviceJwtGuard } from '../auth/guards/device-jwt.guard';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';

@ApiTags('pings')
@ApiBearerAuth('device-jwt')
@UseGuards(DeviceJwtGuard)
@Controller('pings')
export class PingsController {
  constructor(private readonly pingService: PingsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a single GPS ping (device only)' })
  ingestOne(
    @CurrentUser() device: AuthenticatedUser,
    @Body() body: PingPayloadDto,
  ) {
    return this.pingService.ingest(device.tuktukId!, device.sub, [body]);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Submit multiple buffered pings (device only)' })
  ingestMany(
    @CurrentUser() device: AuthenticatedUser,
    @Body() body: BulkPingDto,
  ) {
    return this.pingService.ingest(device.tuktukId!, device.sub, body.pings);
  }
}
