const Joi = require('joi');

const updateStudentSchema = Joi.object({
  name: Joi.string(),
  matricNumber: Joi.string(),
}).min(1); // At least one field is required for update

module.exports = updateStudentSchema;
