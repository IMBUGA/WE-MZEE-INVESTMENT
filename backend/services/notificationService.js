const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.twilioClient = process.env.TWILIO_ACCOUNT_SID ? 
      twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
  }

  async sendEmail(to, subject, html) {
    try {
      if (!process.env.EMAIL_USER) {
        console.log('Email service not configured. Would send:', { to, subject });
        return true;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `WE MZEE: ${subject}`,
        html,
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendSMS(to, message) {
    try {
      if (!this.twilioClient) {
        console.log('SMS service not configured. Would send:', { to, message });
        return true;
      }

      await this.twilioClient.messages.create({
        body: `WE MZEE: ${message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });

      console.log(`SMS sent to ${to}`);
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  // Contribution notifications
  async sendContributionNotification(member, contribution) {
    const subject = 'Contribution Submitted';
    const html = `
      <h2>Contribution Submitted Successfully</h2>
      <p>Hello ${member.name},</p>
      <p>Your contribution of <strong>KSh ${contribution.amount}</strong> has been submitted successfully.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Amount: KSh ${contribution.amount}</li>
        <li>Method: ${contribution.method}</li>
        <li>Transaction ID: ${contribution.transactionId}</li>
        <li>Date: ${new Date(contribution.date).toLocaleDateString()}</li>
        <li>Status: ${contribution.status}</li>
      </ul>
      <p>Thank you for your contribution!</p>
    `;

    await this.sendEmail(member.email, subject, html);
    
    const smsMessage = `Contribution of KSh ${contribution.amount} submitted. Ref: ${contribution.transactionId}`;
    await this.sendSMS(member.phone, smsMessage);
  }

  async sendContributionApprovalNotification(member, contribution) {
    const subject = 'Contribution Approved';
    const html = `
      <h2>Contribution Approved</h2>
      <p>Hello ${member.name},</p>
      <p>Your contribution of <strong>KSh ${contribution.amount}</strong> has been approved.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Amount: KSh ${contribution.amount}</li>
        <li>Method: ${contribution.method}</li>
        <li>Transaction ID: ${contribution.transactionId}</li>
        <li>Approved on: ${new Date(contribution.approvedAt).toLocaleDateString()}</li>
      </ul>
      <p>Your total contributions now stand at KSh ${member.totalContributions}.</p>
    `;

    await this.sendEmail(member.email, subject, html);
    
    const smsMessage = `Contribution of KSh ${contribution.amount} approved. Total: KSh ${member.totalContributions}`;
    await this.sendSMS(member.phone, smsMessage);
  }

  // Loan notifications
  async sendLoanApplicationNotification(member, loan) {
    const subject = 'Loan Application Submitted';
    const html = `
      <h2>Loan Application Submitted</h2>
      <p>Hello ${member.name},</p>
      <p>Your loan application for <strong>KSh ${loan.amount}</strong> has been submitted successfully.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Amount: KSh ${loan.amount}</li>
        <li>Purpose: ${loan.purpose}</li>
        <li>Interest Rate: ${(loan.interestRate * 100).toFixed(1)}%</li>
        <li>Due Date: ${new Date(loan.dueDate).toLocaleDateString()}</li>
        <li>Status: ${loan.status}</li>
      </ul>
      <p>You will be notified once your application is reviewed.</p>
    `;

    await this.sendEmail(member.email, subject, html);
  }

  async sendLoanApprovalNotification(member, loan) {
    const subject = 'Loan Application Approved';
    const html = `
      <h2>Loan Application Approved</h2>
      <p>Hello ${member.name},</p>
      <p>Your loan application for <strong>KSh ${loan.amount}</strong> has been approved.</p>
      <p><strong>Loan Details:</strong></p>
      <ul>
        <li>Amount: KSh ${loan.amount}</li>
        <li>Total Repayable: KSh ${loan.amount + (loan.amount * loan.interestRate)}</li>
        <li>Interest Rate: ${(loan.interestRate * 100).toFixed(1)}%</li>
        <li>Due Date: ${new Date(loan.dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Please ensure timely repayments to maintain good standing.</p>
    `;

    await this.sendEmail(member.email, subject, html);
    
    const smsMessage = `Loan of KSh ${loan.amount} approved. Due: ${new Date(loan.dueDate).toLocaleDateString()}`;
    await this.sendSMS(member.phone, smsMessage);
  }

  // Profit distribution notifications
  async sendProfitDistributionNotification(member, distribution, memberDistribution) {
    const subject = 'Profit Distribution';
    const html = `
      <h2>Profit Distribution</h2>
      <p>Hello ${member.name},</p>
      <p>Your share of the profit distribution for <strong>${distribution.period}</strong> has been processed.</p>
      <p><strong>Distribution Details:</strong></p>
      <ul>
        <li>Period: ${distribution.period}</li>
        <li>Total Group Profit: KSh ${distribution.totalProfit}</li>
        <li>Your Share: KSh ${memberDistribution.amount}</li>
        <li>Share Percentage: ${memberDistribution.sharePercentage.toFixed(1)}%</li>
        <li>Reinvested: ${memberDistribution.reinvested ? 'Yes' : 'No'}</li>
        ${memberDistribution.reinvested ? 
          `<li>Reinvestment Amount: KSh ${memberDistribution.reinvestmentAmount}</li>` : ''}
      </ul>
      <p>Your total profits to date: KSh ${member.totalProfits}</p>
    `;

    await this.sendEmail(member.email, subject, html);
    
    const smsMessage = `Profit share of KSh ${memberDistribution.amount} distributed for ${distribution.period}`;
    await this.sendSMS(member.phone, smsMessage);
  }

  // Reminder notifications
  async sendContributionReminder(member, month, year) {
    const subject = 'Monthly Contribution Reminder';
    const html = `
      <h2>Monthly Contribution Reminder</h2>
      <p>Hello ${member.name},</p>
      <p>This is a friendly reminder to submit your monthly contribution for ${month} ${year}.</p>
      <p>Please submit your contribution through your preferred method (M-Pesa, Bank, or Cash).</p>
      <p>If you have already submitted, please ignore this reminder.</p>
    `;

    await this.sendEmail(member.email, subject, html);
    
    const smsMessage = `Reminder: Please submit your ${month} contribution`;
    await this.sendSMS(member.phone, smsMessage);
  }

  async sendLoanRepaymentReminder(member, loan) {
    const daysUntilDue = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const subject = 'Loan Repayment Reminder';
    const html = `
      <h2>Loan Repayment Reminder</h2>
      <p>Hello ${member.name},</p>
      <p>Your loan repayment of <strong>KSh ${loan.amount}</strong> is due in ${daysUntilDue} days.</p>
      <p><strong>Loan Details:</strong></p>
      <ul>
        <li>Original Amount: KSh ${loan.amount}</li>
        <li>Remaining Balance: KSh ${loan.remainingBalance}</li>
        <li>Due Date: ${new Date(loan.dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Please ensure timely repayment to avoid penalties.</p>
    `;

    await this.sendEmail(member.email, subject, html);
    
    const smsMessage = `Loan repayment reminder: KSh ${loan.remainingBalance} due in ${daysUntilDue} days`;
    await this.sendSMS(member.phone, smsMessage);
  }
}

module.exports = new NotificationService();