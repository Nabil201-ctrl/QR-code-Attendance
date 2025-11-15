import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { QrCode, QrCodeSchema } from '../schemas/qrcode.schema'; // Import QrCode schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Student.name, schema: StudentSchema },
      { name: QrCode.name, schema: QrCodeSchema }, // Register QrCode schema here
    ]),
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
