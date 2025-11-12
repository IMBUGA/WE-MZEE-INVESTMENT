const express = require('express');
const Investment = require('../models/Investment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all investments
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('createdBy', 'name')
      .populate('participants.member', 'name')
      .sort({ createdAt: -1 });
    
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create investment
router.post('/', auth, async (req, res) => {
  try {
    const investment = new Investment({
      ...req.body,
      createdBy: req.member.id
    });

    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update investment
router.put('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'name');
    
    res.json(investment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get investment statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const investments = await Investment.find();
    
    const stats = {
      totalInvestments: investments.length,
      totalCapital: investments.reduce((sum, inv) => sum + inv.capital, 0),
      totalCurrentValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0),
      activeInvestments: investments.filter(inv => inv.status === 'active').length,
      completedInvestments: investments.filter(inv => inv.status === 'completed').length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;