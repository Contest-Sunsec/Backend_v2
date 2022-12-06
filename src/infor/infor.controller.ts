import { Body, Controller, Get, Query, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Response, Request } from 'express';
import { InforSensor } from './infor.model';

@Controller('infor')
export class InforController {
  constructor(
    private readonly jwtservice: JwtService,
    @InjectModel(InforSensor) private inforModel: typeof InforSensor,
  ) {}

  @Get()
  async getInfro(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const data = this.jwtservice.verify(query.token);
    const infor = await this.inforModel.findAll({
      where: {
        sensorId: data.sensorId,
      },
    });
    return res.status(200).json(infor.slice(-7));
  }
}
