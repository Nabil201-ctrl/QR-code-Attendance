import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';
import { QrCode, QrCodeDocument } from '../schemas/qrcode.schema';
import { Student, StudentDocument } from '../schemas/student.schema';
import { Attendance, AttendanceDocument } from '../schemas/attendance.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(QrCode.name) private qrCodeModel: Model<QrCodeDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async generateQrCode(generateQrCodeDto: GenerateQrCodeDto) {
    const { expiresIn } = generateQrCodeDto;
    const expiresAt = new Date(Date.now() + expiresIn * 1000); // expiresIn is in seconds
    const data = `ATTENDANCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const qrCode = await this.qrCodeModel.create({
      data,
      expiresAt,
    });

    return qrCode;
  }

  async getAttendance() {
    // The populate method should return a document with the student field fully populated.
    // With StudentDocument now explicitly defining _id: string, this should work.
    const attendanceRecords = await this.attendanceModel.find().populate('student').exec();

    // Group attendance by student and then by date for the table view
    const studentAttendanceMap = new Map<string, any>();

    for (const record of attendanceRecords) {
      if (!record.student) {
        continue;
      }
      // Now record.student should be correctly typed as StudentDocument with _id: string
      const student = record.student;

      const studentId = student._id.toString();
      if (!studentAttendanceMap.has(studentId)) {
        studentAttendanceMap.set(studentId, {
          id: student._id,
          name: student.name,
          matricNumber: student.matricNumber,
          dates: {},
        });
      }
      const studentData = studentAttendanceMap.get(studentId);
      const dateKey = record.date.toISOString().split('T')[0]; // YYYY-MM-DD
      studentData.dates[dateKey] = record.present ? 1 : 0;
    }

    // Convert map to array and determine all unique dates
    const students = Array.from(studentAttendanceMap.values());
    const allDates = Array.from(new Set(attendanceRecords.map(record => record.date.toISOString().split('T')[0]))).sort();

    return { students, allDates };
  }

  async getStudents(): Promise<StudentDocument[]> {
    return this.studentModel.find().exec();
  }

  async deleteAttendance(id: string) {
    return this.attendanceModel.findByIdAndDelete(id).exec();
  }
}