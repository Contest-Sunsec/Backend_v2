import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { ResponseDto } from 'src/ResponseDto';
import { SensorDto, SensorResDto, SensorResClientDto } from './dto/SensorDto';
import { Sensor } from './hardware.model';

@Injectable()
export class HardwareService {
  constructor(@InjectModel(Sensor) private sensorModel: typeof Sensor) {}
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
        latitude: sensorDto.latitude,
        longitude: sensorDto.longitude,
        uptime: sensorDto.uptime,
        speed: sensorDto.speed,
        ping: sensorDto.ping,
        bettery: sensorDto.bettery,
        status: true,
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
          latitude: newData.latitude,
          longitude: newData.longitude,
          uptime: newData.uptime,
          speed: newData.speed,
          ping: newData.ping,
          bettery: newData.bettery,
          updatedAt: newData.updatedAt,
          status: newData.status,
        },
      };
    } catch (err) {
      console.log(err);
    }
  }

  async getOneSensor(id: string): Promise<ResponseDto<SensorResClientDto>> {
    try {
      const sensor = await this.sensorModel.findOne({
        where: {
          id,
        },
      });
      if (!sensor) return { status: 400, message: '' };

      const mili = new Date().getTime() - sensor.uptime.getTime();
      const second = mili / 1000;
      const minute = second / 60;
      console.log(sensor);

      const position: any = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${sensor.longitude}&y=${sensor.latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_KEY}`,
          },
        },
      );

      const weather: any = await axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${sensor.latitude}&lon=${sensor.longitude}&appid=${process.env.OPENWEATHER_KEY}`,
        )
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
        });

      const humidity_message =
        weather.main.humidity > 65
          ? weather.main.humidity > 75
            ? '매우 습함'
            : '습함'
          : weather.main.humidity > 55
          ? '건조함'
          : '매우 건조함';

      const weatherData = {
        temp: weather.main.temp - 273.15,
        humidity: weather.main.humidity,
        humidity_message,
        min: weather.main.temp_min - 273.15,
        feel: weather.main.feels_like - 273.15,
      };

      if (minute > 10) {
        return {
          status: 200,
          message: '하드웨어 정보를 가져왔어요',
          responseData: {
            id: sensor.id,
            airHum: sensor.airHum,
            airTemp: sensor.airTemp,
            soilEc: sensor.soilEc,
            soilHum: sensor.soilHum,
            soilTemp: sensor.soilTemp,
            solar: sensor.solar,
            createdAt: sensor.createdAt,
            updatedAt: sensor.updatedAt,
            uptime: sensor.uptime,
            ping: sensor.ping,
            speed: sensor.speed,
            bettery: sensor.bettery,
            position: `${position.data.documents[0].region_1depth_name} ${position.data.documents[0].region_2depth_name}`,
            weather: weatherData,
            status: false,
          },
        };
      }
      return {
        status: 200,
        message: '하드웨어 정보를 가져왔어요',
        responseData: {
          id: sensor.id,
          airHum: sensor.airHum,
          airTemp: sensor.airTemp,
          soilEc: sensor.soilEc,
          soilHum: sensor.soilHum,
          soilTemp: sensor.soilTemp,
          solar: sensor.solar,
          createdAt: sensor.createdAt,
          updatedAt: sensor.updatedAt,
          uptime: sensor.uptime,
          ping: sensor.ping,
          bettery: sensor.bettery,
          speed: sensor.speed,
          position: `${position.document.address.region_1depth_name} ${position.document.address.region_2depth_name}`,
          weather: weatherData,
          status: true,
        },
      };
    } catch (e) {
      console.log(e);
    }
  }
}
