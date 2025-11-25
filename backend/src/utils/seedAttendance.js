const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/student.model');
const Attendance = require('../models/attendance.model');
const QrCode = require('../models/qrcode.model'); // Import QrCode model

dotenv.config();

const seedAttendance = async () => {
    try {
        await mongoose.connect("mongodb+srv://abubakarnabil:admin123@qrcode.atvxjaa.mongodb.net/?appName=qrcode");
        console.log('✅ Connected to MongoDB for seeding attendance');

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0); // Start of yesterday

        // Find or Create a QrCode for yesterday's "reading program"
        let qrCodeForYesterday = await QrCode.findOne({
            purpose: 'reading program',
            createdAt: { $gte: yesterday }, // Created yesterday or later (start of day)
            expiresAt: { $gte: yesterday }, // Valid for yesterday (start of day)
        });

        if (!qrCodeForYesterday) {
            console.log('No suitable QR Code found for yesterday\'s reading program. Creating one...');
            const expiresAt = new Date(yesterday);
            expiresAt.setHours(23, 59, 59, 999); // End of yesterday

            qrCodeForYesterday = await QrCode.create({
                data: `reading-program-yesterday-${yesterday.getTime()}`, // Unique data string
                createdAt: yesterday,
                expiresAt: expiresAt,
                purpose: 'reading program',
            });
            console.log(`Created new QR Code with ID: ${qrCodeForYesterday._id}`);
        } else {
            console.log(`Using existing QR Code with ID: ${qrCodeForYesterday._id}`);
        }

        const qrCodeId = qrCodeForYesterday._id;

        const students = await Student.find({});
        if (students.length === 0) {
            console.log('No students found to seed attendance. Please add students first.');
            return;
        }

        let processedCount = 0;

        for (const student of students) {
            const filter = {
                student: student._id,
                date: yesterday,
                purpose: 'reading program',
            };

            const update = {
                $set: {
                    present: true,
                    deviceFingerprint: 'seeded-fingerprint', // Placeholder
                    qrCode: qrCodeId,
                    date: yesterday, // Ensure date is set/updated
                    purpose: 'reading program', // Ensure purpose is set/updated
                }
            };

            const options = {
                upsert: true, // Create a new document if no document matches the filter
                new: true, // Return the modified document rather than the original
                setDefaultsOnInsert: true // Apply default values if inserting
            };

            const result = await Attendance.findOneAndUpdate(filter, update, options);

            if (result) {
                processedCount++;
            }
        }
        console.log(`Seeding complete: ${processedCount} attendance records processed (created or updated).`);

    } catch (error) {
        console.error('❌ Error seeding attendance:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔗 Disconnected from MongoDB');
    }
};

seedAttendance();