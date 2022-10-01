import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, RegisterResDto } from './dto/RegisterDto';
import { ForgotDto } from './dto/FogotDto';
import { LoginDto, LoginResDto } from './dto/LoginDto';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './auth.models';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ResetDto } from './dto/ResetDto';
import { ResponseDto } from '../ResponseDto';
import { UserResDto } from './dto/UserResDto';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailerService,
    private jwtService: JwtService,
    @InjectModel(Users)
    private usersModel: typeof Users,
  ) {}

  async registerService(
    registerDto: RegisterDto,
  ): Promise<ResponseDto<RegisterResDto>> {
    try {
      const user = await this.usersModel.findOne({
        where: {
          email: registerDto.email,
        },
      });

      if (user) {
        return { status: 400, message: '', responseData: { id: user.id } };
      }
      const hashedPassword = crypto
        .createHash('sha256')
        .update(registerDto.password)
        .digest('hex');

      const newUser = await this.usersModel.create({
        id: uuidv4(),
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      });

      return { status: 200, message: '', responseData: { id: newUser.id } };
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async loginService(loginDto: LoginDto): Promise<ResponseDto<LoginResDto>> {
    try {
      const user = await this.usersModel.findOne({
        where: { email: loginDto.email },
      });
      if (!user) {
        return { status: 400, message: '' };
      }

      const hashedPassword = crypto
        .createHash('sha256')
        .update(loginDto.password)
        .digest('hex');

      if (user.password !== hashedPassword) {
        return { status: 400, message: '' };
      }
      const token = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
        },
        {
          expiresIn: '2h',
        },
      );

      return {
        status: 200,
        message: '',
        responseData: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
          },
        },
      };
    } catch (err) {
      console.log(err);

      return { status: 500, message: err };
    }
  }

  async forgetService(forgotDto: ForgotDto): Promise<ResponseDto<any>> {
    try {
      const user = await this.usersModel.findOne({
        where: {
          email: forgotDto.email,
        },
      });
      if (!user) {
        return { status: 400, message: '' };
      }
      const token = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
        },
        {
          expiresIn: '5m',
        },
      );
      await this.mailService.sendMail({
        to: forgotDto.email,
        subject: 'Farmsert 비밀번호 재설정',
        html: `
            <h1>비밀번호 재설정</h1>
            <p>아래 링크를 클릭하면 비밀번호를 재설정할 수 있어요</p>
            <br/>
            <h3 style="color: #07B1BC;">아래 링크로 이동해주세요</h3>
            <p>${process.env.FRONTEND_URL}/reset-password/${token}</p>
        `,
      });
      return { status: 200, message: '', responseData: { token } };
    } catch (err) {}
  }

  async resetService(resetDto: ResetDto): Promise<ResponseDto<any>> {
    try {
      const decoded = this.jwtService.verify(resetDto.token);

      if (!decoded) {
        return decoded;
      }

      const user = this.usersModel.findOne({
        where: decoded.id,
      });

      if (!user) {
        return { status: 400, message: '' };
      }

      const hashedPassword = crypto
        .createHash('sha256')
        .update(resetDto.password)
        .digest('hex');

      await Users.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            id: decoded.id,
          },
        },
      );
    } catch (err) {}
  }

  async userService(token: string): Promise<ResponseDto<UserResDto>> {
    try {
      const decoded = this.jwtService.verify(token);

      if (!decoded) {
        return { status: 401, message: '' };
      }

      const user = await Users.findOne({
        where: {
          id: decoded.id,
        },
        attributes: {
          exclude: ['password'],
        },
      });
      return {
        status: 200,
        message: '',
        responseData: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
          },
        },
      };
    } catch (err) {
      return { status: 400, message: '' };
    }
  }
}
