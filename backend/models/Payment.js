const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  tuitionFee: { type: Number, default: 0 },
  miscFee: { type: Number, default: 500 },
  labFee: { type: Number, default: 0 },
  registrationFee: { type: Number, default: 200 },
  otherFees: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  transactions: [{
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['Cash', 'Online Transfer', 'Bank Deposit', 'GCash', 'Maya'],
      required: true
    },
    referenceNumber: { type: String },
    date: { type: Date, default: Date.now },
    processedBy: { type: String, default: 'Cashier' },
    notes: { type: String }
  }]
}, {
  timestamps: true
});

// Auto-compute totals before save
PaymentSchema.pre('save', function (next) {
  this.totalAmount = this.tuitionFee + this.miscFee + this.labFee + this.registrationFee + this.otherFees;
  this.amountPaid = this.transactions.reduce((sum, t) => sum + t.amount, 0);
  this.balance = this.totalAmount - this.amountPaid;

  if (this.balance <= 0) this.status = 'Paid';
  else if (this.amountPaid > 0) this.status = 'Partial';
  else this.status = 'Unpaid';

  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
