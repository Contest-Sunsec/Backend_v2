import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
// import { Interval } from '@nestjs/schedule';
import { readFileSync, writeFileSync } from 'fs';
import { ResponseDto } from 'src/ResponseDto';
import {
  HardwareDto,
  HardwareResDto,
  HardwareResClientDto,
} from './dto/HardwareDto';
import { SensorDto, SensorResDto } from './dto/SensorDto';
import { Sensor } from './hardware.model';

@Injectable()
export class HardwareService {
  constructor(@InjectModel(Sensor) private sensorModel: typeof Sensor) {}
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
        speed: hardwareData.speed,
        ping: hardwareData.ping,
        status: true,
      },
    };
  }

  async getHardware(): Promise<ResponseDto<HardwareResClientDto>> {
    const dataBuffer = readFileSync('../ ../hardware.json');
    if (dataBuffer === undefined) return { status: 400, message: '' };
    const dataJson = dataBuffer.toString();
    const data = JSON.parse(dataJson);
    const mili = new Date().getTime() - Date.parse(data.uptime);
    const second = mili / 1000;
    const minute = second / 60;
    console.log(data);

    const position: any = await axios.get(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?input_coord=WGS84&x=${data.longitude}&y=${data.latitude}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_KEY}`,
        },
      },
    );

    const weatehr: any = await axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${data.latitude}&lon=${data.longitude}&appid=${process.env.OPENWEATER_KEY}`,
      )
      .then((res) => {
        return res.data;
      });

    const weatehrData = {
      temp: weatehr.main.temp - 273.15,
      humidity: weatehr.main.humidity,
      min: weatehr.main.temp_min - 273.15,
      feel: weatehr.main.feels_like - 273.15,
    };

    if (minute > 10) {
      return {
        status: 200,
        message: '하드웨어 정보를 가져왔어요',
        responseData: {
          uptime: data.uptime,
          ping: data.ping,
          speed: data.speed,
          position: `${position.document.adress.region_1depth_name} ${position.document.adress.region_2depth_name}`,
          weather: weatehrData,
          status: false,
        },
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
      const [newData] = await this.sensorModel.upsert({
        id: sensorDto.id,
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

  // async getScore(id: string): Promise<ResponseDto<SensorScoreDto>> {
  //   try {
  //     const sensor = await this.sensorModel.findOne({
  //       where: {
  //         id,
  //       },
  //     });

  //     if (!sensor) return { status: 400, message: '' };
  //     const standard = {
  //       airHum: 75,
  //       airTemp: 20,
  //       soilEc: 4.8,
  //       soilHum: 65,
  //       soilTemp: 17,
  //       solar: 170,
  //     };

  //     const calcul = {
  //       airHum: Math.abs(sensor.airHum - standard.airHum),
  //       airTemp: Math.abs(sensor.airTemp - standard.airTemp),
  //       soilEc: Math.abs(sensor.soilEc - standard.soilEc),
  //       soilHum: Math.abs(sensor.soilHum - standard.soilHum),
  //       soilTemp: Math.abs(sensor.soilTemp - standard.soilTemp),
  //       solar: Math.abs(sensor.solar - standard.solar),
  //     };

  //     return {
  //       status: 200,
  //       message: '센서 정보를 가져왔어요',
  //       responseData: {
  //         id: sensor.id,
  //         airHum: sensor.airHum,
  //         airTemp: sensor.airTemp,
  //         createdAt: sensor.createdAt,
  //         soilEc: sensor.soilEc,
  //         soilHum: sensor.soilHum,
  //         soilTemp: sensor.soilTemp,
  //         solar: sensor.solar,
  //         updatedAt: sensor.updatedAt,
  //       },
  //   } catch(err) {
  //     console.log(err);
  //   }
  // }

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
