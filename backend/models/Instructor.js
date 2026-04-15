const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const InstructorSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  firstName:  { type: String, required: [true,'First name required'], trim: true },
  lastName:   { type: String, required: [true,'Last name required'],  trim: true },
  email:      { type: String, required: [true,'Email required'], unique: true, lowercase: true },
  department: { type: String, trim: true },
  designation:{ type: String, trim: true, default: 'Instructor' },
  specialization: { type: String, trim: true },
  contactNumber:  { type: String, trim: true },
  isActive:   { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

InstructorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

InstructorSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.employeeId = `TU-${year}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Instructor', InstructorSchema);
