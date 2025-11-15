import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { QrCode, QrCodeSchema } from '../schemas/qrcode.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema'; // Import Attendance schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QrCode.name, schema: QrCodeSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Attendance.name, schema: AttendanceSchema }, // Register Attendance schema here
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
