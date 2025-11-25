const QrCodeModel = require('../models/qrcode.model');
const StudentModel = require('../models/student.model');
const AttendanceModel = require('../models/attendance.model');

class AdminService {
  async generateQrCode(generateQrCodeDto) {
    const { expiresIn, purpose } = generateQrCodeDto;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const data = `ATTENDANCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const qrCode = await QrCodeModel.create({
      data,
      expiresAt,
      purpose,
    });

    return {
      data: qrCode.data,
      expiresAt: qrCode.expiresAt.toISOString(),
      qrCodeId: qrCode._id.toString(),
      purpose: qrCode.purpose,
    };
  }

  async getAttendance() {
    // Get all unique meeting dates from QR codes, considering only the date part
    const meetingDates = (await QrCodeModel.distinct('createdAt')).map(date => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    });
    const uniqueMeetingDates = Array.from(new Set(meetingDates.map(d => d.getTime()))).map(time => new Date(time));
    const sortedMeetingDates = uniqueMeetingDates.sort((a, b) => a - b);

    const allStudents = await StudentModel.find().exec();
    const allAttendance = await AttendanceModel.find().exec();

    // For each meeting date, find a QR code created that day to get its purpose
    const datePurposeMap = {};
    for (const meetingDate of sortedMeetingDates) {
      const start = new Date(meetingDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const qr = await QrCodeModel.findOne({
        createdAt: { $gte: start, $lt: end },
      }).sort({ createdAt: -1 }).exec();

      const key = meetingDate.toISOString().split('T')[0];
      datePurposeMap[key] = qr ? qr.purpose : null;
    }

    const studentAttendance = allStudents.map(student => {
      const studentRecords = allAttendance.filter(record => record.student.equals(student._id));
      
      let presentCount = 0;
      const attendanceDetails = sortedMeetingDates.map(meetingDate => {
        const record = studentRecords.find(r => {
            const recordDate = new Date(r.date);
            return recordDate.getFullYear() === meetingDate.getFullYear() &&
                   recordDate.getMonth() === meetingDate.getMonth() &&
                   recordDate.getDate() === meetingDate.getDate();
        });

        if (record && record.present) {
          presentCount++;
          return { date: meetingDate.toISOString().split('T')[0], status: 1 };
        }
        return { date: meetingDate.toISOString().split('T')[0], status: 0 };
      });

      const attendancePercentage = sortedMeetingDates.length > 0 
        ? (presentCount / sortedMeetingDates.length) * 100 
        : 0;

      return {
        id: student._id,
        name: student.name,
        matricNumber: student.matricNumber,
        attendancePercentage: attendancePercentage.toFixed(2),
        attendanceDetails,
      };
    });

    return {
      students: studentAttendance,
      allDates: sortedMeetingDates.map(d => ({ date: d.toISOString().split('T')[0], purpose: datePurposeMap[d.toISOString().split('T')[0]] })),
    };
  }

  async getStudents() {
    const { students } = await this.getAttendance();
    return students;
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
