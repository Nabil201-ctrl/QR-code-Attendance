const express = require('express');
const adminService = require('../services/admin.service');
const adminController = require('../controllers/admin.controller');
const validationMiddleware = require('../middleware/validation.middleware');
const createStudentSchema = require('../dto/create-student.dto');
const updateStudentSchema = require('../dto/update-student.dto');
const generateQrCodeSchema = require('../dto/generate-qr-code.dto');

const router = express.Router();

// Passkey routes
router.post('/passkey/register-request', adminController.getRegistrationOptions);
router.post('/passkey/register', adminController.verifyRegistration);
router.post('/passkey/login-request', adminController.getAuthenticationOptions);
router.post('/passkey/login', adminController.verifyAuthentication);
// Simple env-based login for local/dev testing
router.post('/simple-login', adminController.simpleLogin);

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

router.get('/attendance/export', async (req, res, next) => {
  try {
    const csvData = await adminService.exportAttendance();
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance.csv');
    res.send(csvData);
  } catch (error) {
    next(error);
  }
});

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

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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

router.post(
  '/students/upload',
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
      const result = await adminService.bulkCreateStudents(req.file.buffer);
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

router.post('/students/bulk-delete', async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }
    const result = await adminService.bulkDeleteStudents(studentIds);
    res.json(result);
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

router.put('/attendance/:studentId/:date', async (req, res, next) => {
  try {
    const { studentId, date } = req.params;
    const { status } = req.body;
    if (status === undefined || (status !== 0 && status !== 1)) {
      return res.status(400).json({ error: 'Status must be 0 (absent) or 1 (present)' });
    }
    const result = await adminService.updateAttendance(studentId, date, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
