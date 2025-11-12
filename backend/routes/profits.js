const express = require('express');
const ProfitDistribution = require('../models/ProfitDistribution');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all profit distributions
router.get('/', auth, async (req, res) => {
  try {
    const distributions = await ProfitDistribution.find()
      .populate('distributedBy', 'name')
      .populate('distributions.member', 'name email')
      .sort({ distributionDate: -1 });
    
    res.json(distributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create profit distribution (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const distribution = new ProfitDistribution({
      ...req.body,
      distributedBy: req.member.id
    });

    await distribution.save();

    // Update members' total profits
    const Member = require('../models/Member');
    for (let dist of distribution.distributions) {
      await Member.findByIdAndUpdate(
        dist.member,
        { $inc: { totalProfits: dist.amount } }
      );
    }

    await distribution.populate('distributions.member', 'name email');
    res.status(201).json(distribution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get my profit distributions
router.get('/my', auth, async (req, res) => {
  try {
    const distributions = await ProfitDistribution.find({
      'distributions.member': req.member.id
    })
    .populate('distributedBy', 'name')
    .sort({ distributionDate: -1 });
    
    const myDistributions = distributions.map(dist => ({
      _id: dist._id,
      period: dist.period,
      totalProfit: dist.totalProfit,
      distributionDate: dist.distributionDate,
      myDistribution: dist.distributions.find(d => 
        d.member.toString() === req.member.id
      )
    }));
    
    res.json(myDistributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;