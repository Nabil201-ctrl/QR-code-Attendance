const QrCodeModel = require('../models/qrcode.model');
const StudentModel = require('../models/student.model');
const AttendanceModel = require('../models/attendance.model');

class AdminService {
  async generateQrCode(generateQrCodeDto) {
    const { expiresIn } = generateQrCodeDto;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const data = `ATTENDANCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const qrCode = await QrCodeModel.create({
      data,
      expiresAt,
    });

    return {
      data: qrCode.data,
      expiresAt: qrCode.expiresAt.toISOString(),
      qrCodeId: qrCode._id.toString()
    };
  }

  async getAttendance() {
    const attendanceRecords = await AttendanceModel.find().populate('student').exec();

    const studentAttendanceMap = new Map();

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

  async getStudents() {
    return StudentModel.find().exec();
  }

  async createStudent(createStudentDto) {
    const { name, matricNumber } = createStudentDto;

    const existingStudent = await StudentModel.findOne({ matricNumber });
    if (existingStudent) {
      throw new Error('Student with this matric number already exists');
    }

    const student = await StudentModel.create({
      name,
      matricNumber,
    });

    return student;
  }

  async updateStudent(id, updateStudentDto) {
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new Error('Student not found');
    }

    if (updateStudentDto.matricNumber && updateStudentDto.matricNumber !== student.matricNumber) {
      const existingStudent = await StudentModel.findOne({ 
        matricNumber: updateStudentDto.matricNumber 
      });
      if (existingStudent) {
        throw new Error('Another student with this matric number already exists');
      }
    }

    const updatedStudent = await StudentModel.findByIdAndUpdate(
      id,
      updateStudentDto,
      { new: true, runValidators: true }
    ).exec();

    if (!updatedStudent) {
      throw new Error('Student not found after update');
    }

    return updatedStudent;
  }

  async deleteStudent(id) {
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new Error('Student not found');
    }

    await AttendanceModel.deleteMany({ student: id }).exec();
    
    await StudentModel.findByIdAndDelete(id).exec();
  }

  async deleteAttendance(id) {
    return AttendanceModel.findByIdAndDelete(id).exec();
  }
}

module.exports = new AdminService();
