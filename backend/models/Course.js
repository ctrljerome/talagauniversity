const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true }
}, { _id: false });

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  units: {
    type: Number,
    required: [true, 'Units are required'],
    min: 1,
    max: 6
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  schedule: [ScheduleSchema],
  maxStudents: {
    type: Number,
    default: 40
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', 'Summer'],
    default: '1st'
  },
  academicYear: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tuitionPerUnit: {
    type: Number,
    default: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: available slots
CourseSchema.virtual('availableSlots').get(function () {
  return this.maxStudents - this.enrolledCount;
});

// Virtual: total tuition
CourseSchema.virtual('totalTuition').get(function () {
  return this.units * this.tuitionPerUnit;
});

module.exports = mongoose.model('Course', CourseSchema);
