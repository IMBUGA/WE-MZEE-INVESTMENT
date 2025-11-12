const express = require('express');
const Contribution = require('../models/Contribution');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Submit contribution
router.post('/', auth, async (req, res) => {
  try {
    const contribution = new Contribution({
      ...req.body,
      member: req.member.id,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear()
    });

    await contribution.save();
    await contribution.populate('member', 'name email');

    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get my contributions
router.get('/my', auth, async (req, res) => {
  try {
    const contributions = await Contribution.find({ 
      member: req.member.id 
    }).populate('approvedBy', 'name').sort({ date: -1 });
    
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all contributions (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const contributions = await Contribution.find()
      .populate('member', 'name email')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });
    
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve contribution (admin only)
router.patch('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.member.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('member', 'name email');
    
    // Update member's total contributions
    const Member = require('../models/Member');
    await Member.findByIdAndUpdate(
      contribution.member._id,
      { $inc: { totalContributions: contribution.amount } }
    );

    res.json(contribution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;