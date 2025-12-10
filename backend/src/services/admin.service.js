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
    const qrDates = (await QrCodeModel.distinct('createdAt')).map(date => {
        const d = new Date(date);
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    });
    
    // Also get dates from attendance records (for admin manual entries)
    const attendanceDates = (await AttendanceModel.distinct('date')).map(date => {
        const d = new Date(date);
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    });
    
    // Merge both date sources
    const allDateTimes = new Set([
      ...qrDates.map(d => d.getTime()),
      ...attendanceDates.map(d => d.getTime())
    ]);
    const sortedMeetingDates = Array.from(allDateTimes).map(time => new Date(time)).sort((a, b) => a - b);

    const allStudents = await StudentModel.find().exec();
    const allAttendance = await AttendanceModel.find().exec();

    // For each meeting date, find a QR code created that day to get its purpose
    const datePurposeMap = {};
    for (const meetingDate of sortedMeetingDates) {
      const start = new Date(Date.UTC(meetingDate.getUTCFullYear(), meetingDate.getUTCMonth(), meetingDate.getUTCDate(), 0, 0, 0));
      const end = new Date(Date.UTC(meetingDate.getUTCFullYear(), meetingDate.getUTCMonth(), meetingDate.getUTCDate(), 23, 59, 59, 999));

      const qr = await QrCodeModel.findOne({
        createdAt: { $gte: start, $lte: end },
      }).sort({ createdAt: -1 }).exec();

      const key = meetingDate.toISOString().split('T')[0];
      datePurposeMap[key] = qr ? qr.purpose : 'Manual Entry';
    }

    const studentAttendance = allStudents.map(student => {
      const studentRecords = allAttendance.filter(record => record.student.equals(student._id));
      
      let presentCount = 0;
      const attendanceDetails = sortedMeetingDates.map(meetingDate => {
        const record = studentRecords.find(r => {
            const recordDate = new Date(r.date);
            // Use UTC date comparison to avoid timezone issues
            return recordDate.getUTCFullYear() === meetingDate.getUTCFullYear() &&
                   recordDate.getUTCMonth() === meetingDate.getUTCMonth() &&
                   recordDate.getUTCDate() === meetingDate.getUTCDate();
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
        _id: student._id,
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

    // Validate required fields
    if (!name || !name.trim()) {
      throw new Error('Student name is required');
    }
    if (!matricNumber || !matricNumber.trim()) {
      throw new Error('Matric number is required');
    }

    const existingStudent = await StudentModel.findOne({ matricNumber: matricNumber.trim() });
    if (existingStudent) {
      throw new Error('Student with this matric number already exists');
    }

    const student = await StudentModel.create({
      name: name.trim(),
      matricNumber: matricNumber.trim(),
    });

    return student;
  }

  async bulkCreateStudents(buffer) {
    const students = [];
    const duplicates = [];
    const created = [];
    const readableStream = require('stream').Readable.from(buffer.toString());
    const csv = require('csv-parser');

    return new Promise((resolve, reject) => {
      readableStream
        .pipe(csv())
        .on('data', (row) => {
          students.push(row);
        })
        .on('end', async () => {
          for (const student of students) {
            const { name, matricNumber } = student;
            if (!name || !matricNumber) {
              continue;
            }
            const existingStudent = await StudentModel.findOne({ matricNumber });
            if (existingStudent) {
              duplicates.push(student);
            } else {
              await StudentModel.create({ name, matricNumber });
              created.push(student);
            }
          }
          resolve({ created, duplicates });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async updateStudent(id, updateStudentDto) {
    // Validate ID format
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Invalid student ID provided');
    }

    // Check if ID is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid student ID format');
    }

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
    // Validate ID format
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Invalid student ID provided');
    }

    // Check if ID is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid student ID format');
    }

    const student = await StudentModel.findById(id);
    if (!student) {
      throw new Error('Student not found');
    }

    // Delete all attendance records for this student
    await AttendanceModel.deleteMany({ student: id }).exec();
    
    // Delete the student
    await StudentModel.findByIdAndDelete(id).exec();
    
    return { message: 'Student deleted successfully' };
  }

  async bulkDeleteStudents(studentIds) {
    const mongoose = require('mongoose');
    const validIds = [];
    const invalidIds = [];
    const deleted = [];
    const notFound = [];

    // Validate all IDs first
    for (const id of studentIds) {
      if (!id || id === 'undefined' || id === 'null' || !mongoose.Types.ObjectId.isValid(id)) {
        invalidIds.push(id);
      } else {
        validIds.push(id);
      }
    }

    // Delete students and their attendance records
    for (const id of validIds) {
      try {
        const student = await StudentModel.findById(id);
        if (!student) {
          notFound.push(id);
          continue;
        }

        // Delete attendance records
        await AttendanceModel.deleteMany({ student: id }).exec();
        // Delete student
        await StudentModel.findByIdAndDelete(id).exec();
        deleted.push(id);
      } catch (error) {
        console.error(`Error deleting student ${id}:`, error);
        invalidIds.push(id);
      }
    }

    return {
      deleted: deleted.length,
      notFound: notFound.length,
      invalid: invalidIds.length,
      message: `Successfully deleted ${deleted.length} student(s)`
    };
  }

  async deleteAttendance(id) {
    return AttendanceModel.findByIdAndDelete(id).exec();
  }

  async updateAttendance(studentId, dateStr, status) {
    const mongoose = require('mongoose');
    
    // Validate student ID
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      throw new Error('Invalid student ID');
    }

    // Validate student exists
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Parse date - treat as UTC date to avoid timezone issues
    // dateStr comes in as "YYYY-MM-DD" format
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Use noon UTC to avoid any date boundary issues
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Create date range for the entire day in UTC
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    console.log('🔍 Looking for attendance record:', {
      studentId,
      dateStr,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    // Find existing attendance record for this date
    const existingRecord = await AttendanceModel.findOne({
      student: studentId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    console.log('📋 Existing record:', existingRecord);

    if (existingRecord) {
      // Update existing record
      existingRecord.present = status === 1;
      await existingRecord.save();
      console.log('✅ Updated existing record:', existingRecord);
      return { 
        message: 'Attendance updated successfully',
        record: existingRecord 
      };
    } else {
      // Create new attendance record - admin manually added
      const newRecord = await AttendanceModel.create({
        student: studentId,
        date: startOfDay, // Use start of day in UTC
        present: status === 1,
        deviceFingerprint: 'admin-manual-entry'
      });
      console.log('✅ Created new record:', newRecord);
      return { 
        message: 'Attendance record created successfully',
        record: newRecord 
      };
    }
  }

  async exportAttendance() {
    const { students, allDates } = await this.getAttendance();

    // CSV Header
    const headers = ['Matriculation Number', 'Name', ...allDates.map(d => `${d.date} (${d.purpose || 'General'})`)];
    
    // CSV Rows
    const rows = students.map(student => {
      const row = {
        'Matriculation Number': student.matricNumber,
        'Name': student.name,
      };
      student.attendanceDetails.forEach(detail => {
        const header = allDates.find(d => d.date === detail.date);
        if (header) {
          const headerKey = `${header.date} (${header.purpose || 'General'})`;
          row[headerKey] = detail.status;
        }
      });
      return row;
    });

    // Convert to CSV string
    const csvRows = [
      headers.join(','),
      ...rows.map(row => headers.map(header => row[header] !== undefined ? row[header] : '').join(','))
    ];

    return csvRows.join('\n');
  }
}

module.exports = new AdminService();
