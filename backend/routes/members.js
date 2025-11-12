const express = require('express');
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all members (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const members = await Member.find().select('-password');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get member by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).select('-password');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update member
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get member statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const Contribution = require('../models/Contribution');
    const Loan = require('../models/Loan');
    
    const contributions = await Contribution.find({ 
      member: req.params.id,
      status: 'approved'
    });
    
    const loans = await Loan.find({ borrower: req.params.id });
    
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const activeLoans = loans.filter(loan => loan.status === 'active');
    
    res.json({
      totalContributions,
      activeLoans: activeLoans.length,
      totalLoans: loans.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;