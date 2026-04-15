const express = require('express');
const router = express.Router();
const {
  getStudents, createStudent, updateStudent, deleteStudent,
  createCourse, updateCourse, deleteCourse,
  updateGrade, getAllGrades,
  createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Student management
router.get('/students', getStudents);
router.post('/students/create', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Course management
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Grade management
router.get('/grades', getAllGrades);
router.put('/grades/:id', updateGrade);

// Announcement management
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router;
