const express = require('express');
const adminService = require('../services/admin.service');
const validationMiddleware = require('../middleware/validation.middleware');
const createStudentSchema = require('../dto/create-student.dto');
const updateStudentSchema = require('../dto/update-student.dto');
const generateQrCodeSchema = require('../dto/generate-qr-code.dto');

const router = express.Router();

router.post(
  '/qr-code',
  validationMiddleware(generateQrCodeSchema),
  async (req, res, next) => {
    try {
      const result = await adminService.generateQrCode(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/attendance', async (req, res, next) => {
  try {
    const result = await adminService.getAttendance();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/students', async (req, res, next) => {
  try {
    const result = await adminService.getStudents();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/students',
  validationMiddleware(createStudentSchema),
  async (req, res, next) => {
    try {
      const result = await adminService.createStudent(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/students/:id',
  validationMiddleware(updateStudentSchema),
  async (req, res, next) => {
    try {
      const result = await adminService.updateStudent(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/students/:id', async (req, res, next) => {
  try {
    await adminService.deleteStudent(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.delete('/attendance/:id', async (req, res, next) => {
  try {
    await adminService.deleteAttendance(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
