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
}

export class HardwareResDto {
  uptime: Date;
  latitude: number;
  longitude: number;
  spped: number;
  status: boolean;
}
