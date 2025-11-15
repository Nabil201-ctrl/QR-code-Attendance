import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceModule } from './attendance/attendance.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://abubakarnabil:admin123@qrcode.atvxjaa.mongodb.net/?appName=qrcode'),
    AttendanceModule,
    AdminModule,
  ],
})
export class AppModule {}
