const Joi = require('joi');

const createStudentSchema = Joi.object({
  name: Joi.string().required(),
  matricNumber: Joi.string().required(),
});

module.exports = createStudentSchema;
