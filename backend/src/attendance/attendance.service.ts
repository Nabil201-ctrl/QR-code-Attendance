import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Attendance, AttendanceDocument } from '../schemas/attendance.schema';
import { QrCode, QrCodeDocument } from '../schemas/qrcode.schema'; // Assuming QrCode model is also available

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(QrCode.name) private qrCodeModel: Model<QrCodeDocument>, // Inject QrCode model
  ) {}

  async submitAttendance(submitAttendanceDto: SubmitAttendanceDto) {
    const { name, matricNumber, qrCodeData } = submitAttendanceDto;

    const qrCode = await this.qrCodeModel.findOne({ data: qrCodeData }).exec();

    if (!qrCode) {
      throw new NotFoundException('Invalid QR Code');
    }

    if (qrCode.expiresAt < new Date()) {
      throw new UnauthorizedException('QR Code has expired');
    }

    let student = await this.studentModel.findOne({ matricNumber }).exec();

    if (!student) {
      student = await this.studentModel.create({
        name,
        matricNumber,
      });
    }

    // Check if attendance already submitted for today for this student
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set to start of tomorrow

    const existingAttendance = await this.attendanceModel.findOne({
      student: student._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).exec();

    if (existingAttendance) {
      throw new UnauthorizedException('Attendance already submitted for today');
    }

    const attendance = await this.attendanceModel.create({
      student: student._id,
      date: new Date(),
      present: true,
    });

    return attendance;
  }
}