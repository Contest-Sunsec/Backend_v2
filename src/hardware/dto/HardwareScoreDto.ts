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

  bettery: number;
}
