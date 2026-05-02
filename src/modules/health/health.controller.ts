import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly mongo: Connection) {}

  @Get()
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      mongo: this.mongo.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
