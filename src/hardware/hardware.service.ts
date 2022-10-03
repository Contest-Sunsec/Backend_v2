import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// import { Interval } from '@nestjs/schedule';
import { readFileSync, writeFileSync } from 'fs';
import { ResponseDto } from 'src/ResponseDto';
import { HardwareDto, HardwareResDto } from './dto/HardwareDto';
import { SensorDto, SensorResDto } from './dto/SensorDto';
import { Sensor } from './hardware.model';

@Injectable()
export class HardwareService {
  constructor(@InjectModel(Sensor) private sensorModel: typeof Sensor) {}
  // @Interval(600000)
  // async checkHardware() {
  //   const dataBuffer = readFileSync('../../hardware.json');
  //   const dataJson = dataBuffer.toString();
  //   const data = JSON.parse(dataJson);
  //   const mili = new Date().getTime() - Date.parse(data.uptime);
  //   const second = mili / 1000;
  //   const minute = second / 60;
  //   console.log(minute);
  // }

  async updateHardware(
    hardwareData: HardwareDto,
  ): Promise<ResponseDto<HardwareResDto>> {
    const jsonData = JSON.stringify(hardwareData);
    console.log(hardwareData);
    writeFileSync('../../hardware.json', jsonData);
    return {
      status: 200,
      message: '하드웨어 정보를 업데이트 했어요',
      responseData: {
        latitude: hardwareData.latitude,
        longitude: hardwareData.longitude,
        uptime: hardwareData.uptime,
        spped: hardwareData.speed,
        status: true,
      },
    };
  }

  async getHardware(): Promise<ResponseDto<HardwareResDto>> {
    const dataBuffer = readFileSync('../../hardware.json');
    if (dataBuffer === undefined) return { status: 400, message: '' };
    const dataJson = dataBuffer.toString();
    const data = JSON.parse(dataJson);
    const mili = new Date().getTime() - Date.parse(data.uptime);
    const second = mili / 1000;
    const minute = second / 60;
    console.log(data);

    if (minute > 10) {
      return {
        status: 200,
        message: '하드웨어 정보를 가져왔어요',
        responseData: { ...data, status: false },
      };
    }
    return {
      status: 200,
      message: '하드웨어 정보를 가져왔어요',
      responseData: { ...data, status: true },
    };
  }

  async postSensor(sensorDto: SensorDto): Promise<ResponseDto<SensorResDto>> {
    try {
      const newData = await this.sensorModel.create({
        airHum: sensorDto.airHum,
        airTemp: sensorDto.airTemp,
        soilEc: sensorDto.soilEc,
        soilHum: sensorDto.soilHum,
        soilTemp: sensorDto.soilTemp,
        solar: sensorDto.solar,
      });
      console.log(newData);

      return {
        status: 200,
        message: '센서 정보를 저장했어요',
        responseData: {
          id: newData.id,
          airHum: newData.airHum,
          airTemp: newData.airTemp,
          createdAt: newData.createdAt,
          soilEc: newData.soilEc,
          soilHum: newData.soilHum,
          soilTemp: newData.soilTemp,
          solar: newData.solar,
          updatedAt: newData.updatedAt,
        },
      };
    } catch (err) {
      console.log(err);
    }
  }

  async getOneSensor(id: string): Promise<ResponseDto<SensorResDto>> {
    try {
      const sensor = await this.sensorModel.findOne({
        where: {
          id,
        },
      });
      if (!sensor) return { status: 400, message: '' };
      return {
        status: 200,
        message: '센서 정보를 가져왔어요',
        responseData: {
          id: sensor.id,
          airHum: sensor.airHum,
          airTemp: sensor.airTemp,
          createdAt: sensor.createdAt,
          soilEc: sensor.soilEc,
          soilHum: sensor.soilHum,
          soilTemp: sensor.soilTemp,
          solar: sensor.solar,
          updatedAt: sensor.updatedAt,
        },
      };
    } catch {}
  }

  async getAllSensor(): Promise<ResponseDto<SensorResDto[]>> {
    try {
      const sensorsData = await this.sensorModel.findAll();
      const sensors: SensorResDto[] = sensorsData.map((value) => {
        return {
          id: value.id,
          airHum: value.airHum,
          airTemp: value.airTemp,
          createdAt: value.createdAt,
          soilEc: value.soilEc,
          soilHum: value.soilHum,
          soilTemp: value.soilTemp,
          solar: value.solar,
          updatedAt: value.updatedAt,
        };
      });
      return {
        status: 200,
        message: '센서 정보를 가져왔어요',
        responseData: sensors,
      };
    } catch (err) {
      return { status: 500, message: '' };
    }
  }
}
