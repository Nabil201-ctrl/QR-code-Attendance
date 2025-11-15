import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from '../schemas/attendance.schema';
import { QrCode, QrCodeDocument } from '../schemas/qrcode.schema';
import { Student, StudentDocument } from '../schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(QrCode.name) private qrCodeModel: Model<QrCodeDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

async generateQrCode(generateQrCodeDto: GenerateQrCodeDto) {
  const { expiresIn } = generateQrCodeDto;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  const data = `ATTENDANCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const qrCode = (await this.qrCodeModel.create({
    data,
    expiresAt,
  })) as any;

  // Return the exact format frontend expects
  return {
    data: qrCode.data,
    expiresAt: qrCode.expiresAt.toISOString(),
    qrCodeId: qrCode._id.toString()
  };
}

  async getAttendance() {
    const attendanceRecords = await this.attendanceModel.find().populate('student').exec();

    const studentAttendanceMap = new Map<string, any>();

    for (const record of attendanceRecords) {
      if (!record.student) {
        continue;
      }
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
      const dateKey = record.date.toISOString().split('T')[0];
      studentData.dates[dateKey] = record.present ? 1 : 0;
    }

    const students = Array.from(studentAttendanceMap.values());
    const allDates = Array.from(new Set(attendanceRecords.map(record => record.date.toISOString().split('T')[0]))).sort();

    return { students, allDates };
  }

  async getStudents(): Promise<StudentDocument[]> {
    return this.studentModel.find().exec();
  }

  async createStudent(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    const { name, matricNumber } = createStudentDto;

    // Check if student with same matric number already exists
    const existingStudent = await this.studentModel.findOne({ matricNumber });
    if (existingStudent) {
      throw new ConflictException('Student with this matric number already exists');
    }

    const student = await this.studentModel.create({
      name,
      matricNumber,
    });

    return student;
  }

  async updateStudent(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentDocument> {
    // Check if student exists first
    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // If updating matric number, check for duplicates
    if (updateStudentDto.matricNumber && updateStudentDto.matricNumber !== student.matricNumber) {
      const existingStudent = await this.studentModel.findOne({ 
        matricNumber: updateStudentDto.matricNumber 
      });
      if (existingStudent) {
        throw new ConflictException('Another student with this matric number already exists');
      }
    }

    const updatedStudent = await this.studentModel.findByIdAndUpdate(
      id,
      updateStudentDto,
      { new: true, runValidators: true }
    ).exec();

    // Safety check - though we already verified the student exists
    if (!updatedStudent) {
      throw new NotFoundException('Student not found after update');
    }

    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Delete associated attendance records
    await this.attendanceModel.deleteMany({ student: id }).exec();
    
    // Delete the student
    await this.studentModel.findByIdAndDelete(id).exec();
  }

  async deleteAttendance(id: string) {
    return this.attendanceModel.findByIdAndDelete(id).exec();
  }
}