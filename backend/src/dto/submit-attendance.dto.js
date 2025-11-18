const Joi = require('joi');

const submitAttendanceSchema = Joi.object({
  name: Joi.string().required(),
  matricNumber: Joi.string().required(),
  qrCodeData: Joi.string().required(),
  deviceFingerprint: Joi.string().required(),
});

module.exports = submitAttendanceSchema;
