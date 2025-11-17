const Joi = require('joi');

const generateQrCodeSchema = Joi.object({
  expiresIn: Joi.number().required(), // expiresIn in seconds
});

module.exports = generateQrCodeSchema;
