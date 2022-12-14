import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { InforSensor } from 'src/infor/infor.model';
import { HardwareController } from './hardware.controller';
import { Sensor } from './hardware.model';
import { HardwareService } from './hardware.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Sensor, InforSensor]),
    ScheduleModule.forRoot(),
  ],
  controllers: [HardwareController],
  providers: [HardwareService],
})
export class HardwareModule {}
