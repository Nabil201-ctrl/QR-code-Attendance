import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from '../health/health.module';
import { AdminModule } from './admin/admin.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://abubakarnabil:admin123@qrcode.atvxjaa.mongodb.net/?appName=qrcode'),
    AttendanceModule,
    AdminModule,
    HealthModule
  ],
})
export class AppModule {}
