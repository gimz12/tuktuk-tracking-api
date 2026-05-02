import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';
import { validateEnv } from '../config/config.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    SeedModule,
  ],
})
class SeedRootModule {}

async function main() {
  const log = new Logger('SeedCLI');
  const app = await NestFactory.createApplicationContext(SeedRootModule, {
    logger: ['error', 'warn', 'log'],
  });
  const seed = app.get(SeedService);
  log.log('Starting seed run…');
  const report = await seed.run(true);

  const outDir = path.resolve(process.cwd(), 'simulation-data');
  fs.mkdirSync(outDir, { recursive: true });

  const credsPath = path.join(outDir, 'device-credentials.json');
  fs.writeFileSync(credsPath, JSON.stringify(report.deviceCredentials, null, 2));
  log.log(`Wrote ${report.deviceCredentials.length} device credentials to ${credsPath}`);

  const summaryPath = path.join(outDir, 'seed-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    ...report,
    deviceCredentials: `see device-credentials.json (${report.deviceCredentials.length} entries)`,
  }, null, 2));
  log.log(`Wrote summary to ${summaryPath}`);

  await app.close();
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
