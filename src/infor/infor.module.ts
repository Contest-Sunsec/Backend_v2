import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { InforController } from './infor.controller';
import { InforSensor } from './infor.model';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
    SequelizeModule.forFeature([InforSensor]),
    ScheduleModule.forRoot(),
  ],
  controllers: [InforController],
  providers: [],
})
export class InforModule {}
