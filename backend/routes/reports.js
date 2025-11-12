const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Member = require('../models/Member');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const Investment = require('../models/Investment');
const ProfitDistribution = require('../models/ProfitDistribution');
const reportService = require('../services/reportService');

const router = express.Router();

// Generate member statement
router.get('/member-statement/:memberId', auth, async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Check if user is authorized to access this member's data
    if (req.member.role === 'member' && req.member.id !== memberId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [member, contributions, loans, profitDistributions] = await Promise.all([
      Member.findById(memberId),
      Contribution.find({ member: memberId }).populate('approvedBy', 'name'),
      Loan.find({ borrower: memberId }),
      ProfitDistribution.find({ 'distributions.member': memberId })
    ]);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const myDistributions = profitDistributions.map(dist => ({
      _id: dist._id,
      period: dist.period,
      totalProfit: dist.totalProfit,
      distributionDate: dist.distributionDate,
      myDistribution: dist.distributions.find(d => 
        d.member.toString() === memberId
      )
    }));

    const pdfBuffer = await reportService.generateMemberStatement(
      member, 
      contributions, 
      loans, 
      myDistributions
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=member-statement-${memberId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating member statement:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Generate group financial report (admin only)
router.get('/group-financial', auth, adminAuth, async (req, res) => {
  try {
    const [investments, contributions, loans, profitDistributions] = await Promise.all([
      Investment.find().populate('createdBy', 'name'),
      Contribution.find().populate('member', 'name').sort({ date: -1 }).limit(100),
      Loan.find().populate('borrower', 'name'),
      ProfitDistribution.find().populate('distributions.member', 'name')
    ]);

    const pdfBuffer = await reportService.generateGroupFinancialReport(
      investments,
      contributions,
      loans,
      profitDistributions
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=group-financial-report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating group financial report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Generate investment report
router.get('/investment/:investmentId', auth, async (req, res) => {
  try {
    const { investmentId } = req.params;
    
    const investment = await Investment.findById(investmentId)
      .populate('createdBy', 'name')
      .populate('participants.member', 'name');

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const pdfBuffer = await reportService.generateInvestmentReport(investment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=investment-report-${investmentId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating investment report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Get dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const [
      totalMembers,
      totalContributions,
      totalInvestments,
      activeLoans,
      totalProfitsDistributed,
      recentContributions,
      activeInvestments
    ] = await Promise.all([
      Member.countDocuments({ status: 'active' }),
      Contribution.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Investment.aggregate([
        { $group: { _id: null, totalCapital: { $sum: '$capital' }, totalValue: { $sum: '$currentValue' } } }
      ]),
      Loan.countDocuments({ status: 'active' }),
      ProfitDistribution.aggregate([
        { $group: { _id: null, total: { $sum: '$totalProfit' } } }
      ]),
      Contribution.find({ status: 'approved' })
        .populate('member', 'name')
        .sort({ date: -1 })
        .limit(5),
      Investment.find({ status: 'active' })
        .populate('createdBy', 'name')
        .limit(5)
    ]);

    const stats = {
      totalMembers,
      totalContributions: totalContributions[0]?.total || 0,
      totalInvestmentCapital: totalInvestments[0]?.totalCapital || 0,
      totalInvestmentValue: totalInvestments[0]?.totalValue || 0,
      activeLoans,
      totalProfitsDistributed: totalProfitsDistributed[0]?.total || 0,
      recentContributions,
      activeInvestments
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;