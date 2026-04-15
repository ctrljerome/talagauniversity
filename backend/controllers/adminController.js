const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const Payment = require('../models/Payment');
const Announcement = require('../models/Announcement');

const sanitize = (str) => str ? String(str).replace(/[<>"']/g, '') : str;

// ─── STUDENT MANAGEMENT ───────────────────────────────────────────────────────

// CREATE STUDENT
exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, program, yearLevel, section, contactNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'First name, last name, email and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const student = await User.create({
      firstName: sanitize(firstName),
      lastName: sanitize(lastName),
      email: email.toLowerCase(),
      password,
      role: 'student',
      program: sanitize(program),
      yearLevel,
      section: sanitize(section),
      contactNumber: sanitize(contactNumber)
    });

    res.status(201).json({
      success: true,
      message: `Student account created. Student ID: ${student.studentId}`,
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        program: student.program,
        yearLevel: student.yearLevel
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL STUDENTS ✅ FIXED
exports.getStudents = async (req, res) => {
  try {
    const { search, program, yearLevel } = req.query;

    const filter = { role: 'student' };

    if (program) filter.program = new RegExp(program, 'i');
    if (yearLevel) filter.yearLevel = yearLevel;

    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') }
      ];
    }

    const students = await User.find(filter)
      .select('-password')
      .sort({ lastName: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE STUDENT
exports.updateStudent = async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'program', 'yearLevel', 'section', 'isActive', 'contactNumber', 'address'];
    const updates = {};

    allowed.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = sanitize(req.body[f]);
    });

    const student = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({ success: true, message: 'Student updated.', student });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE (DEACTIVATE) STUDENT
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({ success: true, message: 'Student deactivated.' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COURSE MANAGEMENT ────────────────────────────────────────────────────────

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      courseCode: sanitize(req.body.courseCode),
      courseName: sanitize(req.body.courseName),
      instructor: sanitize(req.body.instructor)
    });

    res.status(201).json({ success: true, message: 'Course created.', course });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.status(200).json({ success: true, message: 'Course updated.', course });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Course deactivated.' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GRADE MANAGEMENT ─────────────────────────────────────────────────────────

exports.updateGrade = async (req, res) => {
  try {
    const { prelimGrade, midtermGrade, finalGrade } = req.body;

    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade record not found.' });
    }

    if (prelimGrade !== undefined) grade.prelimGrade = prelimGrade;
    if (midtermGrade !== undefined) grade.midtermGrade = midtermGrade;
    if (finalGrade !== undefined) grade.finalGrade = finalGrade;

    await grade.save();

    res.status(200).json({ success: true, message: 'Grade updated.', grade });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllGrades = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;

    const filter = {};
    if (studentId) filter.student = studentId;
    if (courseId) filter.course = courseId;

    const grades = await Grade.find(filter)
      .populate('student', 'studentId firstName lastName program')
      .populate('course', 'courseCode courseName units');

    res.status(200).json({ success: true, grades });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ANNOUNCEMENT MANAGEMENT ──────────────────────────────────────────────────

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      title: sanitize(req.body.title),
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Announcement created.', announcement });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    res.status(200).json({ success: true, announcement });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Announcement removed.' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const Instructor = require('../models/Instructor');

    const [
      totalStudents,
      totalCourses,
      activeAnnouncements,
      totalInstructors
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Course.countDocuments({ isActive: true }),
      Announcement.countDocuments({ isActive: true }),
      Instructor.countDocuments({ isActive: true })
    ]);

    res.status(200).json({
      success: true,
      stats: { totalStudents, totalCourses, activeAnnouncements, totalInstructors }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};