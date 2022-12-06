import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { InforSensor } from 'src/infor/infor.model';
import { ResponseDto } from 'src/ResponseDto';
import { SensorDto, SensorResDto, SensorResClientDto } from './dto/SensorDto';
import { Sensor } from './hardware.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HardwareService {
  constructor(
    @InjectModel(Sensor) private sensorModel: typeof Sensor,
    @InjectModel(InforSensor) private inforModel: typeof InforSensor,
  ) {}
  async  postSensor(sensorDto: SensorDto): Promise<ResponseDto<SensorResDto>> {
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

      await this.inforModel.create({
        id: uuidv4(),
        sensorId: sensorDto.id,
        airHum: sensorDto.airHum,
        airTemp: sensorDto.airTemp,
        soilEc: sensorDto.soilEc,
        soilHum: sensorDto.soilHum,
        soilTemp: sensorDto.soilTemp,
        solar: sensorDto.solar,
      });

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
        .then((res) => res.data);

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

      const defaultData = {
        soilEc: 2.2,
        soliHum: 65,
        soilTemp: 17,
        solar: 700,
        airTemp: 18,
        airHum: 75,
      };

      const messageUnit = {
        soilEc: 'dS/m',
        soliHum: '%',
        soilTemp: '°C',
        solar: 'w/㎡',
        airTemp: '°C',
        airHum: '%',
      };

      const message = {
        data: [],
        messageUnit,
        defaultData,
        score: 0,
        scoreMessage: '',
      };

      let count = 0;

      if (sensor.soilEc < defaultData.soilEc - 1.0) {
        const temp = {
          title: ['토양 염농도가', '기준보다 낮아요'],
          message:
            '토양 염농도가 너무 낮아요. 토양 염농도가 너무 낮으면 식물이 성장하는데에 나쁜 영향을 줄 수 있어요. 토양 염농도를 올려주세요',
          standard: false,
          type: 'soilEc',
        };
        message.data.push(temp);
        count++;
      } else if (sensor.soilEc > defaultData.soilEc + 1.0) {
        const temp = {
          title: ['토양 염농도가', '기준보다 높아요'],
          message:
            '토양 염농도가 너무 높아요. 토양 염농도가 너무 높으면 식물이 성장하는데에 나쁜 영향을 줄 수 있어요. 토양 염농도를 낮춰주세요',
          standard: true,
          type: 'soilEc',
        };
        message.data.push(temp);
        count++;
      }

      if (sensor.soilHum < defaultData.soliHum - 20) {
        const temp = {
          title: ['토양 습도가', '기준보다 낮아요'],
          message:
            '토양 습도가 너무 낮아요. 토양 습도가 너무 낮으면 식물이 성장하는데에 나쁜 영향을 줄 수 있어요. 토양 습도를 올려주세요',
          standard: false,
          type: 'soilHum',
        };
        message.data.push(temp);
        count++;
      } else if (sensor.soilHum > defaultData.soliHum + 20) {
        const temp = {
          title: ['토양 습도가', '기준보다 높아요'],
          message:
            '토양 습도가 너무 높아요. 토양 습도가 너무 높으면 식물이 성장하는데에 나쁜 영향을 줄 수 있어요. 토양 습도를 낮춰주세요',
          standard: true,
          type: 'soilHum',
        };
        message.data.push(temp);
        count++;
      }

      if (sensor.soilTemp < defaultData.soilTemp - 8) {
        const temp = {
          title: ['토양 온도가', '기준보다 낮아요'],
          message:
            '토양 온도가 너무 낮아요. 토양 온도가 너무 낮으면 식물이 성장하는데에 나쁜 영향을 줄 수 있어요. 토양 온도를 올려주세요',
          standard: false,
          type: 'soilTemp',
        };
        message.data.push(temp);
      } else if (sensor.soilTemp > defaultData.soilTemp + 8) {
        const temp = {
          title: ['토양 온도가', '기준보다 높아요'],
          message:
            '토양 온도가 너무 높아요. 토양 온도가 너무 높으면 식물이 성장하는데에 나쁜 영향을 줄 수 있어요. 토양 온도를 낮춰주세요',
          standard: true,
          type: 'soilTemp',
        };
        message.data.push(temp);
        count++;
      }

      if (sensor.solar < defaultData.solar - 350) {
        const temp = {
          title: ['일사량이', '기준보다 낮아요'],
          message:
            '일사량이 너무 낮아요. 일사량 너무 낮으면 식물이 생장하는데에 나쁜 영향을 줄 수 있어요. 작물이 충분한 햇빛을 받을 수 있게 해주세요',
          standard: false,
          type: 'solar',
        };
        message.data.push(temp);
        count++;
      }

      if (sensor.airHum < defaultData.airHum - 30) {
        const temp = {
          title: ['대기 습도가', '기준보다 낮아요'],
          message:
            '습도가 너무 낮아요. 습도가 너무 낮으면 식물이 습도에 의한 피해를 받을 수 있어요. 기온을 높여주세요',
          standard: false,
          type: 'airHum',
        };
        message.data.push(temp);
      } else if (sensor.airHum > defaultData.airHum + 30) {
        const temp = {
          title: ['대기 습도가', '기준보다 높아요'],
          message:
            '습도가 너무 높아요. 습도가 너무 높으면 식물이 습도에 의한 피해를 받을 수 있어요. 기온을 낮춰주세요',
          standard: true,
          type: 'airHum',
        };
        message.data.push(temp);
        count++;
      }

      if (sensor.airTemp < defaultData.airTemp - 15) {
        const temp = {
          title: ['대기 온도가', '기준보다 낮아요'],
          message:
            '온도가 너무 낮아요. 온도가 너무 낮으면 식물이 온도에 의한 피해를 받을 수 있어요. 기온을 높여주세요',
          standard: false,
          type: 'airTemp',
        };
        message.data.push(temp);
      } else if (sensor.airTemp > defaultData.airTemp + 15) {
        const temp = {
          title: ['대기 온도가', '기준보다 높아요'],
          message:
            '온도가 너무 높아요. 온도가 너무 높으면 식물이 온도에 의한 피해를 받을 수 있어요. 기온을 낮춰주세요',
          standard: true,
          type: 'airTemp',
        };
        message.data.push(temp);
        count++;
      }

      const score = 100 - Math.floor(count * (100 / 6));
      message.score = score;

      switch (Math.floor(score / 10)) {
        case 10:
        case 9:
          message.scoreMessage = '좋은 점수에요!';
          break;
        case 8:
        case 7:
          message.scoreMessage = '보통 점수에요.';
          break;
        case 6:
        case 5:
          message.scoreMessage = '나쁜 점수에요.';
          break;
        default:
          message.scoreMessage = '조치가 필요해요!';
          break;
      }

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
            longitude: sensor.longitude,
            latitude: sensor.latitude,
            weather: weatherData,
            message: message,
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
          position: `${position.data.documents[0].region_1depth_name} ${position.data.documents[0].region_2depth_name}`,
          longitude: sensor.longitude,
          latitude: sensor.latitude,
          weather: weatherData,
          message: message,
          status: true,
        },
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: '서버에 문제가 생겼어요',
      };
    }
  }
}
