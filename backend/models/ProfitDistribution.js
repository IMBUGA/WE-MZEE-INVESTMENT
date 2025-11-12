const mongoose = require('mongoose');

const profitDistributionSchema = new mongoose.Schema({
  period: {
    type: String,
    required: true
  },
  totalProfit: {
    type: Number,
    required: true,
    min: 0
  },
  distributionDate: {
    type: Date,
    required: true
  },
  distributedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  distributions: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    sharePercentage: {
      type: Number,
      required: true
    },
    reinvested: {
      type: Boolean,
      default: false
    },
    reinvestmentAmount: {
      type: Number,
      default: 0
    }
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ProfitDistribution', profitDistributionSchema);