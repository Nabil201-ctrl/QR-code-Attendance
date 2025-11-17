const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  matricNumber: { type: String, required: true, unique: true },
});

const StudentModel = mongoose.model('Student', StudentSchema);

module.exports = StudentModel;
