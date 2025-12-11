const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  present: { type: Boolean, default: false },
  qrCode: { type: mongoose.Schema.Types.ObjectId, ref: 'QrCode' },
  purpose: { type: String },
});

const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);

module.exports = AttendanceModel;
