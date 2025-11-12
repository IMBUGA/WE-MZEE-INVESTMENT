import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI } from '../services/api';
import { FileText, Download, Users, TrendingUp, DollarSign } from 'lucide-react';

function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');

  const generateReport = async (type, params = {}) => {
    setLoading(true);
    try {
      let response;
      
      switch (type) {
        case 'member-statement':
          response = await reportsAPI.generateMemberStatement(user.id);
          break;
        case 'group-financial':
          response = await reportsAPI.generateGroupFinancialReport();
          break;
        case 'investment-report':
          if (params.investmentId) {
            response = await reportsAPI.generateInvestmentReport(params.investmentId);
          }
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${type}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ReportCard = ({ title, description, icon: Icon, onGenerate, adminOnly = false }) => {
    if (adminOnly && !['admin', 'treasurer', 'secretary'].includes(user.role)) {
      return null;
    }

    return (
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-50">
              <Icon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onGenerate}
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Statements</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Member Statement */}
        <ReportCard
          title="My Statement"
          description="Generate your personal financial statement with contributions, loans, and profits"
          icon={FileText}
          onGenerate={() => generateReport('member-statement')}
        />

        {/* Group Financial Report - Admin Only */}
        <ReportCard
          title="Group Financial Report"
          description="Comprehensive financial overview of the entire investment group"
          icon={TrendingUp}
          onGenerate={() => generateReport('group-financial')}
          adminOnly={true}
        />

        {/* Member Management Report - Admin Only */}
        <ReportCard
          title="Members Report"
          description="Detailed report of all members and their financial activities"
          icon={Users}
          onGenerate={() => generateReport('member-management')}
          adminOnly={true}
        />

        {/* Investment Portfolio Report - Admin Only */}
        <ReportCard
          title="Investment Portfolio"
          description="Overview of all investments and their performance"
          icon={DollarSign}
          onGenerate={() => generateReport('investment-portfolio')}
          adminOnly={true}
        />

        {/* Loan Portfolio Report - Admin Only */}
        <ReportCard
          title="Loan Portfolio"
          description="Detailed report of all active and completed loans"
          icon={FileText}
          onGenerate={() => generateReport('loan-portfolio')}
          adminOnly={true}
        />

        {/* Profit Distribution Report - Admin Only */}
        <ReportCard
          title="Profit Distribution History"
          description="Historical record of all profit distributions"
          icon={TrendingUp}
          onGenerate={() => generateReport('profit-history')}
          adminOnly={true}
        />
      </div>

      {/* Quick Stats Section */}
      {['admin', 'treasurer', 'secretary'].includes(user.role) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">KSh 1.2M</p>
              <p className="text-sm text-gray-600">Total Contributions</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">KSh 2.8M</p>
              <p className="text-sm text-gray-600">Investment Value</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-600">Active Loans</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Report Generation Tips</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Reports are generated in PDF format for easy printing and sharing</li>
          <li>• Member statements include all your financial activities</li>
          <li>• Group reports provide comprehensive overviews for management</li>
          <li>• All reports include timestamps for record keeping</li>
        </ul>
      </div>
    </div>
  );
}

export default Reports;