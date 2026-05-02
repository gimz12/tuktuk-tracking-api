import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Ping, PingDocument } from '../pings/schemas/ping.schema';
import { LiveLocationsQueryDto } from './dto/live-locations.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/roles.enum';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Ping.name) private readonly model: Model<PingDocument>,
  ) {}

  private scopeFilter(
    user: AuthenticatedUser,
    extra: { provinceId?: string; districtId?: string; stationId?: string },
  ): FilterQuery<PingDocument> {
    const filter: FilterQuery<PingDocument> = {};

    if (user.role === Role.PROVINCE_ADMIN) {
      if (!user.provinceId) throw new BadRequestException('Province scope missing');
      filter.provinceId = new Types.ObjectId(user.provinceId);
    } else if (user.role === Role.STATION_OFFICER) {
      if (!user.stationId) throw new BadRequestException('Station scope missing');
      filter.stationId = new Types.ObjectId(user.stationId);
    }

    if (extra.provinceId) {
      if (filter.provinceId && filter.provinceId.toString() !== extra.provinceId) {
        throw new BadRequestException('Out-of-scope provinceId');
      }
      filter.provinceId = new Types.ObjectId(extra.provinceId);
    }
    if (extra.districtId) {
      filter.districtId = new Types.ObjectId(extra.districtId);
    }
    if (extra.stationId) {
      if (filter.stationId && filter.stationId.toString() !== extra.stationId) {
        throw new BadRequestException('Out-of-scope stationId');
      }
      filter.stationId = new Types.ObjectId(extra.stationId);
    }
    return filter;
  }

  async live(user: AuthenticatedUser, dto: LiveLocationsQueryDto) {
    const baseFilter = this.scopeFilter(user, dto);
    const since = new Date(
      Date.now() - (dto.windowMinutes ?? 30) * 60 * 1000,
    );

    const match: Record<string, unknown> = {
      ...baseFilter,
      recordedAt: { $gte: since },
    };

    const pipeline = [
      { $match: match },
      { $sort: { recordedAt: -1 as const } },
      {
        $group: {
          _id: '$tuktukId',
          tuktukId: { $first: '$tuktukId' },
          deviceId: { $first: '$deviceId' },
          stationId: { $first: '$stationId' },
          districtId: { $first: '$districtId' },
          provinceId: { $first: '$provinceId' },
          location: { $first: '$location' },
          recordedAt: { $first: '$recordedAt' },
          speedKph: { $first: '$speedKph' },
          headingDeg: { $first: '$headingDeg' },
        },
      },
      { $sort: { recordedAt: -1 as const } },
      { $limit: dto.limit ?? 500 },
    ];

    const results = await this.model.aggregate(pipeline);
    return {
      windowMinutes: dto.windowMinutes ?? 30,
      since,
      count: results.length,
      vehicles: results,
    };
  }

  async history(
    user: AuthenticatedUser,
    scope: { provinceId?: string; districtId?: string; stationId?: string },
    dto: HistoryQueryDto,
  ) {
    const filter = this.scopeFilter(user, scope);
    const from = new Date(dto.from);
    const to = new Date(dto.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (from >= to) {
      throw new BadRequestException('"from" must be earlier than "to"');
    }
    const span = to.getTime() - from.getTime();
    if (span > 31 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Window too large (maximum 31 days)');
    }

    filter.recordedAt = { $gte: from, $lte: to };
    const items = await this.model
      .find(filter)
      .sort({ recordedAt: 1 })
      .limit(dto.limit ?? 1000);

    return { from, to, count: items.length, items };
  }
}
