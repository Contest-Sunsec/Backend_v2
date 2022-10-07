import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ResponseDto } from 'src/ResponseDto';
import { HardwareDto } from './dto/HardwareDto';
import { SensorDto } from './dto/SensorDto';
import { HardwareService } from './hardware.service';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}
  @Get()
  @ApiResponse({ type: ResponseDto })
  async getData() {
    return await this.hardwareService.getHardware();
  }

  @Post()
  @ApiResponse({ type: ResponseDto })
  async postData(@Body() hardwareDto: HardwareDto) {
    return await this.hardwareService.updateHardware(hardwareDto);
  }

  @Get('sensor/:id')
  @ApiResponse({ type: ResponseDto })
  async getOneSensor(@Param('id') id: string) {
    return await this.hardwareService.getOneSensor(id);
  }

  @Get('sensor')
  @ApiResponse({ type: ResponseDto })
  async getAllSensor() {
    return await this.hardwareService.getAllSensor();
  }

  // @Get('score/:id')
  // @ApiResponse({ type: ResponseDto })
  // async getScore(@Param('id') id: string) {
  //   return await this.hardwareService.getScore(id);
  // }

  @Post('sensor')
  @ApiResponse({ type: ResponseDto })
  async postSensor(@Body() sensorDto: SensorDto) {
    return await this.hardwareService.postSensor(sensorDto);
  }
}
