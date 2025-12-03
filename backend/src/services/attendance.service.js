const StudentModel = require('../models/student.model');
const AttendanceModel = require('../models/attendance.model');
const QrCodeModel = require('../models/qrcode.model');

class AttendanceService {
  async submitAttendance(submitAttendanceDto) {
    const { name, matricNumber, qrCodeData, deviceFingerprint } =
      submitAttendanceDto;

    const qrCode = await QrCodeModel.findOne({ data: qrCodeData }).exec();

    if (!qrCode) {
      throw new Error('Invalid QR Code');
    }

    if (qrCode.expiresAt < new Date()) {
      throw new Error('QR Code has expired');
    }

    let student = await StudentModel.findOne({ matricNumber }).exec();

    if (!student) {
      student = await StudentModel.create({
        name,
        matricNumber,
      });
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
      deviceFingerprint,
      qrCode: qrCode._id,
      purpose: qrCode.purpose,
    });

    return attendance;
  }
}

module.exports = new AttendanceService();
