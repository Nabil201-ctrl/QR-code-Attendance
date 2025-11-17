const express = require('express');
const attendanceService = require('../services/attendance.service');
const validationMiddleware = require('../middleware/validation.middleware');
const submitAttendanceSchema = require('../dto/submit-attendance.dto');

const router = express.Router();

router.post(
  '/',
  validationMiddleware(submitAttendanceSchema),
  async (req, res, next) => {
    try {
      const result = await attendanceService.submitAttendance(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
