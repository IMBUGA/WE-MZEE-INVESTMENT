const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Member = require('../models/Member');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Send contribution reminder to all members
router.post('/contributions/reminder', auth, adminAuth, async (req, res) => {
  try {
    const { month, year } = req.body;
    
    const activeMembers = await Member.find({ status: 'active' });
    
    const notificationPromises = activeMembers.map(member =>
      notificationService.sendContributionReminder(member, month, year)
    );

    await Promise.all(notificationPromises);

    res.json({ 
      message: `Contribution reminders sent to ${activeMembers.length} members` 
    });
  } catch (error) {
    console.error('Error sending contribution reminders:', error);
    res.status(500).json({ message: 'Error sending reminders' });
  }
});

// Send loan repayment reminders
router.post('/loans/repayment-reminder', auth, adminAuth, async (req, res) => {
  try {
    const activeLoans = await Loan.find({ status: 'active' })
      .populate('borrower');
    
    const upcomingLoans = activeLoans.filter(loan => {
      const daysUntilDue = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7; // Remind if due within 7 days
    });

    const notificationPromises = upcomingLoans.map(loan =>
      notificationService.sendLoanRepaymentReminder(loan.borrower, loan)
    );

    await Promise.all(notificationPromises);

    res.json({ 
      message: `Repayment reminders sent for ${upcomingLoans.length} loans` 
    });
  } catch (error) {
    console.error('Error sending repayment reminders:', error);
    res.status(500).json({ message: 'Error sending reminders' });
  }
});

// Send custom notification to all members
router.post('/broadcast', auth, adminAuth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ 
        message: 'Subject and message are required' 
      });
    }

    const activeMembers = await Member.find({ status: 'active' });
    
    const notificationPromises = activeMembers.map(member =>
      notificationService.sendEmail(member.email, subject, `
        <h2>${subject}</h2>
        <p>Hello ${member.name},</p>
        <div>${message.replace(/\n/g, '<br>')}</div>
        <br>
        <p>Best regards,<br>WE MZEE Investment Group</p>
      `)
    );

    await Promise.all(notificationPromises);

    res.json({ 
      message: `Broadcast message sent to ${activeMembers.length} members` 
    });
  } catch (error) {
    console.error('Error sending broadcast message:', error);
    res.status(500).json({ message: 'Error sending broadcast' });
  }
});

// Get notification statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalMembers,
      pendingContributions,
      pendingLoans,
      upcomingLoanRepayments
    ] = await Promise.all([
      Member.countDocuments({ status: 'active' }),
      Contribution.countDocuments({ status: 'pending' }),
      Loan.countDocuments({ status: 'pending' }),
      Loan.countDocuments({ 
        status: 'active',
        dueDate: { 
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due within 7 days
        }
      })
    ]);

    res.json({
      totalMembers,
      pendingContributions,
      pendingLoans,
      upcomingLoanRepayments
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;