const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Grade = require('../models/Grade');

// @desc    Get all available courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const { semester, academicYear, search } = req.query;
    const filter = { isActive: true };

    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    if (search) {
      filter.$or = [
        { courseCode: new RegExp(search, 'i') },
        { courseName: new RegExp(search, 'i') },
        { instructor: new RegExp(search, 'i') }
      ];
    }

    const courses = await Course.find(filter).sort('courseCode');

    // Mark which courses the student is enrolled in
    if (req.user.role === 'student') {
      const enrolledIds = req.user.enrolledCourses.map(id => id.toString());
      const coursesWithStatus = courses.map(course => ({
        ...course.toJSON(),
        isEnrolled: enrolledIds.includes(course._id.toString())
      }));
      return res.status(200).json({ success: true, count: courses.length, courses: coursesWithStatus });
    }

    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.status(200).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (student)
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!course.isActive) return res.status(400).json({ success: false, message: 'Course is not available.' });

    const user = await User.findById(req.user._id);

    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course.' });
    }

    if (course.enrolledCount >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'Course is full.' });
    }

    // Enroll student
    user.enrolledCourses.push(course._id);
    course.enrolledCount += 1;

    await Promise.all([user.save({ validateBeforeSave: false }), course.save()]);

    // Create grade record
    await Grade.create({
      student: user._id,
      course: course._id,
      semester: course.semester,
      academicYear: course.academicYear
    });

    // Update payment — add tuition for this course
    let payment = await Payment.findOne({
      student: user._id,
      semester: course.semester,
      academicYear: course.academicYear
    });

    if (!payment) {
      payment = new Payment({
        student: user._id,
        semester: course.semester,
        academicYear: course.academicYear
      });
    }

    payment.tuitionFee += course.units * (course.tuitionPerUnit || 500);
    await payment.save();

    res.status(200).json({ success: true, message: `Successfully enrolled in ${course.courseName}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin enrolls a specific student in a course
// @route   POST /api/courses/:id/enroll-student
// @access  Private (admin)
exports.enrollStudentByCourse = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required.' });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!course.isActive) return res.status(400).json({ success: false, message: 'Course is not available.' });

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ success: false, message: 'Student not found.' });

    if (user.enrolledCourses.map(id => id.toString()).includes(course._id.toString())) {
      return res.status(400).json({ success: false, message: `${user.firstName} is already enrolled in ${course.courseCode}.` });
    }

    if (course.enrolledCount >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'Course is full.' });
    }

    user.enrolledCourses.push(course._id);
    course.enrolledCount += 1;
    await Promise.all([user.save({ validateBeforeSave: false }), course.save()]);

    // Grade record
    const existingGrade = await Grade.findOne({ student: user._id, course: course._id, semester: course.semester, academicYear: course.academicYear });
    if (!existingGrade) {
      await Grade.create({ student: user._id, course: course._id, semester: course.semester, academicYear: course.academicYear });
    }

    // Payment
    let payment = await Payment.findOne({ student: user._id, semester: course.semester, academicYear: course.academicYear });
    if (!payment) payment = new Payment({ student: user._id, semester: course.semester, academicYear: course.academicYear });
    payment.tuitionFee += course.units * (course.tuitionPerUnit || 500);
    await payment.save();

    res.status(200).json({ success: true, message: `${user.firstName} ${user.lastName} enrolled in ${course.courseName}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// @access  Private (student)
exports.dropCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const user = await User.findById(req.user._id);

    if (!user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ success: false, message: 'Not enrolled in this course.' });
    }

    user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== course._id.toString());
    course.enrolledCount = Math.max(0, course.enrolledCount - 1);

    // Update grade to Dropped
    await Grade.findOneAndUpdate(
      { student: user._id, course: course._id, semester: course.semester },
      { remarks: 'Dropped' }
    );

    // Update payment
    let payment = await Payment.findOne({
      student: user._id,
      semester: course.semester,
      academicYear: course.academicYear
    });

    if (payment) {
      payment.tuitionFee = Math.max(0, payment.tuitionFee - (course.units * (course.tuitionPerUnit || 500)));
      await payment.save();
    }

    await Promise.all([user.save({ validateBeforeSave: false }), course.save()]);

    res.status(200).json({ success: true, message: `Successfully dropped ${course.courseName}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get enrolled courses for student
// @route   GET /api/courses/enrolled
// @access  Private (student)
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses',
      select: 'courseCode courseName units instructor schedule semester academicYear department'
    });

    res.status(200).json({ success: true, courses: user.enrolledCourses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
