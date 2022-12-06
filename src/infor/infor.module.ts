import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { InforController } from './infor.controller';
import { InforSensor } from './infor.model';

@Module({
  imports: [
    SequelizeModule.forFeature([InforSensor]),
    ScheduleModule.forRoot(),
  ],
  controllers: [InforController],
  providers: [JwtService],
})
export class InforModule {}
