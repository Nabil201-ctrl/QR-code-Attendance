const mongoose = require('mongoose');

const QrCodeSchema = new mongoose.Schema({
  data: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  purpose: { type: String, required: true },
});

const QrCodeModel = mongoose.model('QrCode', QrCodeSchema);

module.exports = QrCodeModel;
