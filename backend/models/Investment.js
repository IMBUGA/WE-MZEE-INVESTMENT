const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mmf', 'agribusiness', 'livestock', 'real_estate'],
    required: true
  },
  description: String,
  capital: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  expectedProfit: {
    type: Number,
    default: 0
  },
  actualProfit: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'paused'],
    default: 'planning'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  participants: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    share: {
      type: Number,
      default: 0
    }
  }],
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Investment', investmentSchema);