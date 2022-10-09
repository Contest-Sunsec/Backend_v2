import { ApiProperty } from '@nestjs/swagger';

export class SensorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  soilEc: number;

  @ApiProperty()
  soilTemp: number;

  @ApiProperty()
  soilHum: number;

  @ApiProperty()
  airTemp: number;

  @ApiProperty()
  airHum: number;

  @ApiProperty()
  solar: number;

  @ApiProperty()
  uptime: Date;

  @ApiProperty()
  speed: number;

  @ApiProperty()
  ping: number;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  bettery: number;
}

export class SensorResDto {
  id: string;
  soilEc: number;
  soilTemp: number;
  soilHum: number;
  airTemp: number;
  airHum: number;
  solar: number;
  uptime: Date;
  latitude: number;
  longitude: number;
  speed: number;
  ping: number;
  bettery: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export class SensorResClientDto {
  id: string;
  soilEc: number;
  soilTemp: number;
  soilHum: number;
  airTemp: number;
  airHum: number;
  solar: number;
  uptime: Date;
  position: string;
  weather: object;
  speed: number;
  ping: number;
  bettery: number;
  status: boolean;
  message: object;
  createdAt: Date;
  updatedAt: Date;
}
