import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './auth.models';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      // secret: process.env.JWT_SECRET,
    }),
    SequelizeModule.forFeature([Users]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
