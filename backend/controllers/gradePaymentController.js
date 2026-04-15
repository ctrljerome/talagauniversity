// ─── GRADES CONTROLLER ────────────────────────────────────────────────────────
const Grade = require('../models/Grade');
const Payment = require('../models/Payment');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @desc    Get student grades
// @route   GET /api/grades
// @access  Private
exports.getMyGrades = async (req, res) => {
  try {
    const { semester, academicYear } = req.query;
    const filter = { student: req.user._id };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const grades = await Grade.find(filter)
      .populate('course', 'courseCode courseName units department')
      .sort({ createdAt: -1 });

    // GPA Computation
    const passedGrades = grades.filter(g => g.gpEquivalent && g.remarks !== 'Dropped');
    let gpa = 0;
    let totalUnits = 0;

    if (passedGrades.length > 0) {
      // Weighted GPA
      const weighted = passedGrades.reduce((sum, g) => sum + ((g.gpEquivalent || 0) * (g.course?.units || 0)), 0);
      totalUnits = passedGrades.reduce((sum, g) => sum + (g.course?.units || 0), 0);
      gpa = totalUnits > 0 ? parseFloat((weighted / totalUnits).toFixed(4)) : 0;
    }

    res.status(200).json({
      success: true,
      grades,
      summary: { gpa, totalUnits, totalSubjects: grades.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PAYMENTS CONTROLLER ──────────────────────────────────────────────────────

// @desc    Get payment info
// @route   GET /api/payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ANNOUNCEMENTS CONTROLLER ─────────────────────────────────────────────────

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }]
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ isPinned: -1, publishedAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('createdBy', 'firstName lastName');
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    res.status(200).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyGrades: exports.getMyGrades, getMyPayments: exports.getMyPayments, getAnnouncements: exports.getAnnouncements, getAnnouncement: exports.getAnnouncement };
