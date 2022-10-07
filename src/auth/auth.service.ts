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
        return {
          status: 400,
          message: '이미 가입된 이메일 주소에요',
          responseData: { id: user.id },
        };
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
        hardwareId: registerDto.hardwareId,
      });

      return {
        status: 200,
        message: '회원가입에 성공했어요',
        responseData: { id: newUser.id },
      };
    } catch (err) {
      console.log(err);
      return { status: 500, message: '서버 에러가 발생했어요' };
    }
  }

  async loginService(loginDto: LoginDto): Promise<ResponseDto<LoginResDto>> {
    try {
      const user = await this.usersModel.findOne({
        where: { email: loginDto.email },
      });
      if (!user) {
        return { status: 400, message: '가입되지 않은 이메일 주소에요' };
      }

      const hashedPassword = crypto
        .createHash('sha256')
        .update(loginDto.password)
        .digest('hex');

      if (user.password !== hashedPassword) {
        return { status: 400, message: '비밀번호가 올바르지 않아요' };
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
        message: '로그인에 성공했어요',
        responseData: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            hardwareId: user.hardwareId,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
          },
        },
      };
    } catch (err) {
      console.log(err);

      return { status: 500, message: '서버 에러가 발생했어요' };
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
        return { status: 400, message: '가입되지 않은 이메일 주소에요' };
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
      return {
        status: 200,
        message: '비밀번호 재설정 링크를 이메일로 보냈어요',
        responseData: { token },
      };
    } catch (err) {
      return { status: 500, message: '서버 에러가 발생했어요' };
    }
  }

  async resetService(resetDto: ResetDto): Promise<ResponseDto<any>> {
    try {
      const decoded = this.jwtService.verify(resetDto.token);

      if (!decoded) {
        return { status: 400, message: '유효하지 않은 토큰이에요' };
      }

      const user = this.usersModel.findOne({
        where: decoded.id,
      });

      if (!user) {
        return { status: 400, message: '가입되지 않은 이메일 주소에요' };
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

      return { status: 200, message: '비밀번호를 재설정했어요' };
    } catch (err) {
      return { status: 500, message: '서버 에러가 발생했어요' };
    }
  }

  async userService(token: string): Promise<ResponseDto<UserResDto>> {
    try {
      const decoded = this.jwtService.verify(token);

      if (!decoded) {
        return { status: 401, message: '유효하지 않은 토큰이에요' };
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
        message: '사용자 정보를 가져왔어요',
        responseData: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            hardwareId: user.hardwareId,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
          },
        },
      };
    } catch (err) {
      return { status: 400, message: '토큰이 만료되었어요' };
    }
  }
}
