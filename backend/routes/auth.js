const express = require('express');
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new member
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, idNumber, phone, nextOfKin } = req.body;

    // Check if member already exists
    const existingMember = await Member.findOne({ 
      $or: [{ email }, { idNumber }] 
    });
    
    if (existingMember) {
      return res.status(400).json({ 
        message: 'Member with this email or ID already exists' 
      });
    }

    const member = new Member({
      name,
      email,
      password,
      idNumber,
      phone,
      nextOfKin
    });

    await member.save();

    // Generate token
    const token = jwt.sign(
      { id: member._id }, 
      process.env.JWT_SECRET || 'we_mzee_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const member = await Member.findOne({ email });
    if (!member || !(await member.correctPassword(password, member.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (member.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    const token = jwt.sign(
      { id: member._id },
      process.env.JWT_SECRET || 'we_mzee_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current member
router.get('/me', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.member.id).select('-password');
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;