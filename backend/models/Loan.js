const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  purpose: String,
  interestRate: {
    type: Number,
    default: 0.08
  },
  duration: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'completed', 'defaulted'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  repayments: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    method: String,
    transactionId: String
  }],
  remainingBalance: {
    type: Number,
    default: 0
  },
  totalRepaid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

loanSchema.pre('save', function(next) {
  if (this.isNew) {
    this.remainingBalance = this.amount + (this.amount * this.interestRate);
  }
  next();
});

module.exports = mongoose.model('Loan', loanSchema);