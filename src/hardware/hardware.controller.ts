import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ResponseDto } from 'src/ResponseDto';
import { SensorDto } from './dto/SensorDto';
import { HardwareService } from './hardware.service';

@Controller('sensor')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}
  @Get(':id')
  @ApiResponse({ type: ResponseDto })
  async getOneSensor(@Param('id') id: string) {
    return await this.hardwareService.getOneSensor(id);
  }

  @Post()
  @ApiResponse({ type: ResponseDto })
  async postSensor(@Body() sensorDto: SensorDto) {
    return await this.hardwareService.postSensor(sensorDto);
  }
}
