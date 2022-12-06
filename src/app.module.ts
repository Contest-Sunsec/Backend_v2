import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailerModule } from '@nestjs-modules/mailer';
import { Users } from './auth/auth.models';
import { HardwareModule } from './hardware/hardware.module';
import { Sensor } from './hardware/hardware.model';
import { InforModule } from './infor/infor.module';
import { Alert } from './auth/alert.model';
import { InforSensor } from './infor/infor.model';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Users, Sensor, Alert, InforSensor],
      autoLoadModels: true,
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    HardwareModule,
    InforModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
