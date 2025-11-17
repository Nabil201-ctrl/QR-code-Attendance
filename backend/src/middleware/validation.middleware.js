const validationMiddleware = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((i) => i.message).join(', ');
    return res.status(400).json({ message });
  }
  next();
};

module.exports = validationMiddleware;
