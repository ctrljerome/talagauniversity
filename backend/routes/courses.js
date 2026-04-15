const express = require('express');
const router = express.Router();
const { getCourses, getCourse, enrollCourse, enrollStudentByCourse, dropCourse, getEnrolledCourses } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getCourses);
router.get('/enrolled', getEnrolledCourses);
router.get('/:id', getCourse);
router.post('/:id/enroll', authorize('student'), enrollCourse);
router.post('/:id/enroll-student', authorize('admin'), enrollStudentByCourse);
router.delete('/:id/drop', authorize('student'), dropCourse);

module.exports = router;
