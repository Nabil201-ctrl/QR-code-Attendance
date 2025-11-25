const Joi = require('joi');

const generateQrCodeSchema = Joi.object({
  expiresIn: Joi.number().required(), // expiresIn in seconds
  purpose: Joi.string().min(3).max(200).required(),
});

module.exports = generateQrCodeSchema;
