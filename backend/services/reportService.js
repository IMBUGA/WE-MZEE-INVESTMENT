const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportService {
  generateMemberStatement(member, contributions, loans, profitDistributions) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(20).text('WE MZEE INVESTMENT GROUP', { align: 'center' });
        doc.fontSize(16).text('Member Statement', { align: 'center' });
        doc.moveDown();

        // Member Information
        doc.fontSize(14).text('Member Information:', { underline: true });
        doc.fontSize(12);
        doc.text(`Name: ${member.name}`);
        doc.text(`Email: ${member.email}`);
        doc.text(`Phone: ${member.phone}`);
        doc.text(`ID Number: ${member.idNumber}`);
        doc.text(`Join Date: ${new Date(member.joinDate).toLocaleDateString()}`);
        doc.moveDown();

        // Summary
        doc.fontSize(14).text('Financial Summary:', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Contributions: KSh ${member.totalContributions?.toLocaleString() || 0}`);
        doc.text(`Total Profits: KSh ${member.totalProfits?.toLocaleString() || 0}`);
        doc.moveDown();

        // Contributions
        doc.fontSize(14).text('Contributions:', { underline: true });
        if (contributions.length > 0) {
          contributions.forEach(contribution => {
            doc.fontSize(10);
            doc.text(
              `${new Date(contribution.date).toLocaleDateString()} - ` +
              `KSh ${contribution.amount.toLocaleString()} - ` +
              `${contribution.method} - ${contribution.status}`
            );
          });
        } else {
          doc.text('No contributions found');
        }
        doc.moveDown();

        // Loans
        doc.fontSize(14).text('Loans:', { underline: true });
        if (loans.length > 0) {
          loans.forEach(loan => {
            doc.fontSize(10);
            doc.text(
              `${new Date(loan.startDate).toLocaleDateString()} - ` +
              `KSh ${loan.amount.toLocaleString()} - ` +
              `Status: ${loan.status} - Balance: KSh ${loan.remainingBalance?.toLocaleString() || 0}`
            );
          });
        } else {
          doc.text('No loans found');
        }
        doc.moveDown();

        // Profit Distributions
        doc.fontSize(14).text('Profit Distributions:', { underline: true });
        if (profitDistributions.length > 0) {
          profitDistributions.forEach(dist => {
            doc.fontSize(10);
            doc.text(
              `${dist.period} - ` +
              `KSh ${dist.myDistribution.amount.toLocaleString()} - ` +
              `${new Date(dist.distributionDate).toLocaleDateString()}`
            );
          });
        } else {
          doc.text('No profit distributions found');
        }

        doc.moveDown();
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  generateGroupFinancialReport(investments, contributions, loans, profitDistributions) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(20).text('WE MZEE INVESTMENT GROUP', { align: 'center' });
        doc.fontSize(16).text('Financial Report', { align: 'center' });
        doc.moveDown();

        // Executive Summary
        doc.fontSize(14).text('Executive Summary:', { underline: true });
        doc.fontSize(12);
        
        const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
        const totalInvestmentCapital = investments.reduce((sum, i) => sum + i.capital, 0);
        const totalInvestmentValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
        const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
        const totalProfits = profitDistributions.reduce((sum, p) => sum + p.totalProfit, 0);

        doc.text(`Total Contributions: KSh ${totalContributions.toLocaleString()}`);
        doc.text(`Total Investment Capital: KSh ${totalInvestmentCapital.toLocaleString()}`);
        doc.text(`Total Investment Current Value: KSh ${totalInvestmentValue.toLocaleString()}`);
        doc.text(`Total Loans Issued: KSh ${totalLoans.toLocaleString()}`);
        doc.text(`Total Profits Distributed: KSh ${totalProfits.toLocaleString()}`);
        doc.moveDown();

        // Investments Breakdown
        doc.fontSize(14).text('Investments Breakdown:', { underline: true });
        investments.forEach(investment => {
          doc.fontSize(10);
          doc.text(
            `${investment.name} - ` +
            `Capital: KSh ${investment.capital.toLocaleString()} - ` +
            `Current: KSh ${investment.currentValue.toLocaleString()} - ` +
            `Status: ${investment.status}`
          );
        });
        doc.moveDown();

        // Recent Contributions
        doc.fontSize(14).text('Recent Contributions:', { underline: true });
        contributions.slice(0, 10).forEach(contribution => {
          doc.fontSize(8);
          doc.text(
            `${new Date(contribution.date).toLocaleDateString()} - ` +
            `${contribution.member?.name} - ` +
            `KSh ${contribution.amount.toLocaleString()} - ` +
            `${contribution.method}`
          );
        });
        doc.moveDown();

        // Active Loans
        doc.fontSize(14).text('Active Loans:', { underline: true });
        const activeLoans = loans.filter(loan => loan.status === 'active');
        activeLoans.forEach(loan => {
          doc.fontSize(10);
          doc.text(
            `${loan.borrower?.name} - ` +
            `KSh ${loan.amount.toLocaleString()} - ` +
            `Due: ${new Date(loan.dueDate).toLocaleDateString()} - ` +
            `Balance: KSh ${loan.remainingBalance?.toLocaleString() || 0}`
          );
        });

        doc.moveDown();
        doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  generateInvestmentReport(investment) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(20).text('WE MZEE INVESTMENT GROUP', { align: 'center' });
        doc.fontSize(16).text('Investment Report', { align: 'center' });
        doc.moveDown();

        // Investment Details
        doc.fontSize(14).text('Investment Details:', { underline: true });
        doc.fontSize(12);
        doc.text(`Name: ${investment.name}`);
        doc.text(`Type: ${investment.type}`);
        doc.text(`Description: ${investment.description}`);
        doc.text(`Capital: KSh ${investment.capital.toLocaleString()}`);
        doc.text(`Current Value: KSh ${investment.currentValue.toLocaleString()}`);
        doc.text(`Expected Profit: KSh ${investment.expectedProfit.toLocaleString()}`);
        doc.text(`Actual Profit: KSh ${investment.actualProfit.toLocaleString()}`);
        doc.text(`Start Date: ${new Date(investment.startDate).toLocaleDateString()}`);
        if (investment.endDate) {
          doc.text(`End Date: ${new Date(investment.endDate).toLocaleDateString()}`);
        }
        doc.text(`Status: ${investment.status}`);
        doc.moveDown();

        // Performance Metrics
        doc.fontSize(14).text('Performance Metrics:', { underline: true });
        const roi = ((investment.currentValue - investment.capital) / investment.capital * 100).toFixed(2);
        doc.text(`Return on Investment: ${roi}%`);
        doc.text(`Profit/Loss: KSh ${(investment.currentValue - investment.capital).toLocaleString()}`);
        doc.moveDown();

        // Milestones
        if (investment.milestones && investment.milestones.length > 0) {
          doc.fontSize(14).text('Milestones:', { underline: true });
          investment.milestones.forEach(milestone => {
            doc.fontSize(10);
            const status = milestone.completed ? '✓' : '◯';
            doc.text(
              `${status} ${milestone.title} - ` +
              `Due: ${new Date(milestone.dueDate).toLocaleDateString()}`
            );
            if (milestone.description) {
              doc.text(`   ${milestone.description}`);
            }
          });
        }

        doc.moveDown();
        doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();