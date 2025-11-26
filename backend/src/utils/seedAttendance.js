// quickAddAttendance.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function quickAddAttendance() {
  try {
    await mongoose.connect("mongodb+srv://abubakarnabil:admin123@qrcode.atvxjaa.mongodb.net/?appName=qrcode");
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all students
    const students = await db.collection('students').find({}).toArray();
    console.log(`📊 Found ${students.length} students`);

    const today = new Date().toISOString().split('T')[0]; // Today's date YYYY-MM-DD
    
    let updatedCount = 0;

    for (const student of students) {
      // Create today's attendance record
      const todayAttendance = {
        date: today,
        purpose: "Daily Session",
        status: 1, // Present
        scannedAt: new Date()
      };

      // If student already has attendanceDetails, add to it, otherwise create new array
      if (student.attendanceDetails && Array.isArray(student.attendanceDetails)) {
        // Check if today's record already exists
        const todayExists = student.attendanceDetails.some(detail => detail.date === today);
        if (!todayExists) {
          student.attendanceDetails.push(todayAttendance);
          await db.collection('students').updateOne(
            { _id: student._id },
            { $set: { attendanceDetails: student.attendanceDetails } }
          );
          updatedCount++;
        }
      } else {
        // Create new attendanceDetails array
        await db.collection('students').updateOne(
          { _id: student._id },
          { $set: { attendanceDetails: [todayAttendance] } }
        );
        updatedCount++;
      }
    }

    console.log(`\n✅ Updated ${updatedCount} students with today's attendance`);
    console.log(`📅 Date: ${today}`);
    console.log(`🎯 All marked as PRESENT`);

    // Show sample
    const sampleStudents = await db.collection('students').find({}).limit(2).toArray();
    console.log('\n📝 Sample:');
    sampleStudents.forEach(student => {
      console.log(`👤 ${student.name}:`);
      if (student.attendanceDetails) {
        const latest = student.attendanceDetails[student.attendanceDetails.length - 1];
        console.log(`   📅 ${latest.date}: ${latest.purpose} - ✅ Present`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

quickAddAttendance();