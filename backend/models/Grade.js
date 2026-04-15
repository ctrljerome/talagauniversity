const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', 'Summer'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  prelimGrade:  { type: Number, min: 0, max: 100 },
  midtermGrade: { type: Number, min: 0, max: 100 },
  finalGrade:   { type: Number, min: 0, max: 100 },
  finalRating: { type: Number, min: 0, max: 100 },
  remarks: {
    type: String,
    enum: ['Passed', 'Failed', 'Incomplete', 'Dropped', 'In Progress'],
    default: 'In Progress'
  },
  gpEquivalent: { type: Number }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Unique constraint: one grade record per student per course per semester
GradeSchema.index({ student: 1, course: 1, semester: 1, academicYear: 1 }, { unique: true });

// Auto-compute final rating
GradeSchema.pre('save', function (next) {
  const grades = [this.prelimGrade, this.midtermGrade, this.finalGrade].filter(g => g != null);
  if (grades.length > 0) {
    this.finalRating = parseFloat((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2));

    // GP Equivalent (Philippine grading system)
    const r = this.finalRating;
    if (r >= 97) this.gpEquivalent = 1.00;
    else if (r >= 94) this.gpEquivalent = 1.25;
    else if (r >= 91) this.gpEquivalent = 1.50;
    else if (r >= 88) this.gpEquivalent = 1.75;
    else if (r >= 85) this.gpEquivalent = 2.00;
    else if (r >= 82) this.gpEquivalent = 2.25;
    else if (r >= 79) this.gpEquivalent = 2.50;
    else if (r >= 76) this.gpEquivalent = 2.75;
    else if (r >= 75) this.gpEquivalent = 3.00;
    else this.gpEquivalent = 5.00;

    this.remarks = this.gpEquivalent <= 3.00 ? 'Passed' : 'Failed';
  }
  next();
});

module.exports = mongoose.model('Grade', GradeSchema);
