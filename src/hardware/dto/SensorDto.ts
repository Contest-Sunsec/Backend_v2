import { ApiProperty } from '@nestjs/swagger';

export class SensorDto {
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
}

export class SensorResDto {
  id: string;

  soilEc: number;

  soilTemp: number;

  soilHum: number;

  airTemp: number;

  airHum: number;

  solar: number;

  createdAt: Date;

  updatedAt: Date;
}
