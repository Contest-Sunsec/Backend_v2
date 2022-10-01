import { Body, Controller, Get, Post, Res, Req } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ForgotDto } from './dto/FogotDto';
import { LoginDto } from './dto/LoginDto';
import { RegisterDto } from './dto/RegisterDto';
import { ResetDto } from './dto/ResetDto';
import { ResponseDto } from '../ResponseDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
