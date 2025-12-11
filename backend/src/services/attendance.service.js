const StudentModel = require('../models/student.model');
const AttendanceModel = require('../models/attendance.model');
const QrCodeModel = require('../models/qrcode.model');

class AttendanceService {
  async submitAttendance(submitAttendanceDto) {
    const { name, matricNumber, qrCodeData } =
      submitAttendanceDto;

    const qrCode = await QrCodeModel.findOne({ data: qrCodeData }).exec();

    if (!qrCode) {
      throw new Error('Invalid QR Code');
    }

    if (qrCode.expiresAt < new Date()) {
      throw new Error('QR Code has expired');
    }

    // Find student in database - must be pre-registered by admin
    const student = await StudentModel.findOne({ matricNumber }).exec();

    if (!student) {
      throw new Error('Student not found. Your matric number is not registered in the system. Please contact your instructor or admin to register you before marking attendance.');
    }

    // Optionally verify name matches (case-insensitive, trimmed)
    const registeredName = student.name.trim().toLowerCase();
    const submittedName = name.trim().toLowerCase();
    if (registeredName !== submittedName) {
      throw new Error(`Name mismatch. The registered name for matric number ${matricNumber} does not match the name you entered. Please ensure you enter your name exactly as registered.`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await AttendanceModel.findOne({
      student: student._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).exec();

    if (existingAttendance) {
      return existingAttendance;
    }

    const attendance = await AttendanceModel.create({
      student: student._id,
      date: new Date(),
      present: true,
      qrCode: qrCode._id,
      purpose: qrCode.purpose,
    });

    return attendance;
  }
}

module.exports = new AttendanceService();
