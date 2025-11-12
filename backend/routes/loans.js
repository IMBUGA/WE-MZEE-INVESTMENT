const express = require('express');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Apply for loan
router.post('/', auth, async (req, res) => {
  try {
    const loan = new Loan({
      ...req.body,
      borrower: req.member.id
    });

    await loan.save();
    await loan.populate('borrower', 'name email');

    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get my loans
router.get('/my', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ borrower: req.member.id })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all loans (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('borrower', 'name email phone')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve loan (admin only)
router.patch('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.member.id
      },
      { new: true }
    ).populate('borrower', 'name email');
    
    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add repayment
router.post('/:id/repayments', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.repayments.push(req.body);
    loan.totalRepaid += req.body.amount;
    loan.remainingBalance -= req.body.amount;

    if (loan.remainingBalance <= 0) {
      loan.status = 'completed';
    }

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;