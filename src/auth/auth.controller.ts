import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  HttpException,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Response, Request, query } from 'express';
import { AuthService } from './auth.service';
import { ForgotDto } from './dto/FogotDto';
import { LoginDto } from './dto/LoginDto';
import { RegisterDto } from './dto/RegisterDto';
import { ResetDto } from './dto/ResetDto';
import { ResponseDto } from '../ResponseDto';
import { InjectModel } from '@nestjs/sequelize';
import { Alert } from './alert.model';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly mailService: MailerService,
    private jwtService: JwtService,
    private readonly authService: AuthService,
    @InjectModel(Alert) private alertModel: typeof Alert,
  ) {}

  @Post('/register')
  @ApiResponse({ type: ResponseDto })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const data = await this.authService.registerService(registerDto);
    return res.status(data.status).json(data);
  }

  @Post('/login')
  @ApiResponse({ type: ResponseDto })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const data = await this.authService.loginService(loginDto);
    return res.status(data.status).json(data);
  }

  @Post('/forget')
  @ApiResponse({ type: ResponseDto })
  async forget(@Body() forgotDto: ForgotDto, @Res() res: Response) {
    const data = await this.authService.forgetService(forgotDto);
    return res.status(data.status).json(data);
  }

  @Post('/reset')
  @ApiResponse({ type: ResponseDto })
  async reset(@Body() resetDto: ResetDto, @Res() res: Response) {
    const data = await this.authService.resetService(resetDto);
    return res.status(data.status).json(data);
  }

  @Get('/user')
  @ApiResponse({ type: ResponseDto })
  async user(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.userService(req.headers.authorization);
    return res.status(data.status).json(data);
  }

  @Get('/alert')
  async getAlert(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any,
  ) {
    console.log(query);
    const decoded = this.jwtService.verify(query.token);

    if (!decoded) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    console.log(decoded);
    this.alertModel
      .findAll({
        where: {
          userId: decoded.id,
          check: false,
        },
      })
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: err });
      });
  }

  @Put('/hardwareError')
  async putHardware(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const decoded = this.jwtService.verify(query.token);

    if (!decoded) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.mailService.sendMail({
      to: decoded.email,
      subject: 'Farmsert 기기 문제 알림',
      html: `
          <h1>하드웨어 문제 발생</h1>
          <p>하드웨어에 문제가 발생하였습니다. 기기 상태를 확인해주세요.</p>
      `,
    });

    this.alertModel.create({
      userId: decoded.id,
      id: uuidv4(),
      name: '(하드웨어) 배터리의 값이 잘 맞지 않는 것 같아요, 기기 상태를 확인해주세요.',
      check: false,
    });
    return res.status(200).json({ message: 'ok' });
  }

  @Post('/hardwareError')
  async postHardware(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    const decoded = this.jwtService.verify(body.token);
    const alertId = body.id;

    if (!decoded) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!alertId) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    this.alertModel.update(
      {
        check: true,
      },
      {
        where: {
          id: alertId,
        },
      },
    );

    return res.status(200).json({ message: 'ok' });
  }
}
