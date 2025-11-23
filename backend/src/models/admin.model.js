const mongoose = require('mongoose');

const authenticatorSchema = new mongoose.Schema({
  credentialID: { type: Buffer, required: true, unique: true },
  credentialPublicKey: { type: Buffer, required: true },
  counter: { type: Number, required: true },
  credentialDeviceType: { type: String, required: true },
  credentialBackedUp: { type: Boolean, required: true },
  transports: [String],
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  currentChallenge: { type: String },
  authenticators: [authenticatorSchema],
});

module.exports = mongoose.model('Admin', adminSchema);
