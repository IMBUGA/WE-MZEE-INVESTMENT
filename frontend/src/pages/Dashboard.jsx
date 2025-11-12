import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { contributionsAPI, investmentsAPI, loansAPI, profitsAPI } from '../services/api';
import { 
  DollarSign, Users, TrendingUp, PieChart,
  Calendar, ArrowUp, ArrowDown 
} from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentContributions, setRecentContributions] = useState([]);
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [contributions, investmentsData, loans, profits] = await Promise.all([
        contributionsAPI.getMy(),
        investmentsAPI.getAll(),
        loansAPI.getMy(),
        profitsAPI.getMy()
      ]);

      setRecentContributions(contributions.slice(0, 5));
      setInvestments(investmentsData.slice(0, 3));

      const totalContributions = contributions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0);

      const activeLoans = loans.filter(loan => loan.status === 'active');
      const totalProfits = profits.reduce((sum, p) => sum + p.myDistribution.amount, 0);

      setStats({
        totalContributions,
        activeInvestments: investmentsData.filter(i => i.status === 'active').length,
        activeLoans: activeLoans.length,
        totalProfits
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="card">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-50">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">KSh {value?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contributions"
          value={stats.totalContributions}
          icon={DollarSign}
        />
        <StatCard
          title="Active Investments"
          value={stats.activeInvestments}
          icon={TrendingUp}
        />
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={Users}
        />
        <StatCard
          title="Total Profits"
          value={stats.totalProfits}
          icon={PieChart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contributions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Contributions</h2>
          <div className="space-y-3">
            {recentContributions.map(contribution => (
              <div key={contribution._id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">KSh {contribution.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 capitalize">{contribution.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{contribution.status}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(contribution.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Investments */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Active Investments</h2>
          <div className="space-y-3">
            {investments.map(investment => (
              <div key={investment._id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{investment.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    investment.status === 'active' ? 'bg-green-100 text-green-800' :
                    investment.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {investment.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Capital: KSh {investment.capital.toLocaleString()}</span>
                  <span>Value: KSh {investment.currentValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;