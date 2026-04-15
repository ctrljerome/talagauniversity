const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  studentId:  { type: String, unique: true, sparse: true },
  firstName:  { type: String, required: [true,'First name required'], trim: true, maxlength: 50 },
  lastName:   { type: String, required: [true,'Last name required'],  trim: true, maxlength: 50 },
  email:      { type: String, required: [true,'Email required'], unique: true, lowercase: true,
                match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] },
  password:   { type: String, required: [true,'Password required'], minlength: 8, select: false },
  role:       { type: String, enum: ['student','admin'], default: 'student' },
  // Academic info — admin-managed only
  program:    { type: String, trim: true },
  yearLevel:  { type: Number, min: 1, max: 6 },
  section:    { type: String, trim: true },
  contactNumber: { type: String, trim: true },
  address:    { type: String, trim: true },
  // Enrollment
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isActive:   { type: Boolean, default: true },
  // Security
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isNew && this.role === 'student' && !this.studentId) {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.studentId = `${year}-${rand}`;
  }
  next();
});

UserSchema.methods.comparePassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

UserSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', UserSchema);
