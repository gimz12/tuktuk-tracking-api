import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './config/config.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProvincesModule } from './modules/provinces/provinces.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { StationsModule } from './modules/stations/stations.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { DevicesModule } from './modules/devices/devices.module';
import { TuktuksModule } from './modules/tuktuks/tuktuks.module';
import { PingsModule } from './modules/pings/pings.module';
import { LocationsModule } from './modules/locations/locations.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('THROTTLE_TTL') ?? 60) * 1000,
          limit: Number(config.get('THROTTLE_LIMIT') ?? 120),
        },
      ],
    }),
    AuthModule,
    UsersModule,
    ProvincesModule,
    DistrictsModule,
    StationsModule,
    DriversModule,
    DevicesModule,
    TuktuksModule,
    PingsModule,
    LocationsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
