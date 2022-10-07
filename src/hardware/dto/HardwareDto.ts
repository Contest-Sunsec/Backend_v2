import { ApiProperty } from '@nestjs/swagger';

export class HardwareDto {
  @ApiProperty()
  uptime: Date;
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  longitude: number;
  @ApiProperty()
  speed: number;
  @ApiProperty()
  ping: number;
}

export class HardwareResDto {
  uptime: Date;
  latitude: number;
  longitude: number;
  speed: number;
  ping: number;
  status: boolean;
}

export class HardwareResClientDto {
  uptime: Date;
  position: string;
  speed: number;
  ping: number;
  weather: object;
  status: boolean;
}
