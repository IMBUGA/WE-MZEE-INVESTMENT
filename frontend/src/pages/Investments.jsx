import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { investmentsAPI } from '../services/api';
import { Plus, TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';

function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'mmf',
    description: '',
    capital: '',
    expectedProfit: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: '',
    milestones: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const [investmentsData, statsData] = await Promise.all([
        investmentsAPI.getAll(),
        investmentsAPI.getStats()
      ]);
      setInvestments(investmentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading investments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await investmentsAPI.create(formData);
      setFormData({
        name: '',
        type: 'mmf',
        description: '',
        capital: '',
        expectedProfit: '',
        startDate: new Date().toISOString().split('T')[0],
        duration: '',
        milestones: []
      });
      setShowForm(false);
      await loadInvestments();
    } catch (error) {
      console.error('Error creating investment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      planning: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      mmf: 'bg-purple-100 text-purple-800',
      agribusiness: 'bg-green-100 text-green-800',
      livestock: 'bg-orange-100 text-orange-800',
      real_estate: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const InvestmentCard = ({ investment }) => (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{investment.name}</h3>
          <p className="text-sm text-gray-600">{investment.description}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(investment.type)}`}>
            {investment.type.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
            {investment.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Capital</p>
          <p className="font-semibold">KSh {investment.capital?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Current Value</p>
          <p className="font-semibold">KSh {investment.currentValue?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expected Profit</p>
          <p className="font-semibold">KSh {investment.expectedProfit?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Actual Profit</p>
          <p className="font-semibold">KSh {investment.actualProfit?.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Started: {new Date(investment.startDate).toLocaleDateString()}</span>
        </div>
        {investment.endDate && (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Ends: {new Date(investment.endDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {investment.milestones && investment.milestones.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Milestones</p>
          <div className="space-y-2">
            {investment.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Investment
        </button>
      </div>

      {/* Investment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Capital</p>
              <p className="text-2xl font-bold">KSh {stats.totalCapital?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold">KSh {stats.totalCurrentValue?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Investments</p>
              <p className="text-2xl font-bold">{stats.activeInvestments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold">{stats.totalInvestments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create New Investment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Maize Farming Season 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="input-field"
                >
                  <option value="mmf">Money Market Fund (MMF)</option>
                  <option value="agribusiness">Agribusiness</option>
                  <option value="livestock">Livestock</option>
                  <option value="real_estate">Real Estate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capital Amount (KSh)
                </label>
                <input
                  type="number"
                  required
                  value={formData.capital}
                  onChange={(e) => setFormData(prev => ({ ...prev, capital: e.target.value }))}
                  className="input-field"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Profit (KSh)
                </label>
                <input
                  type="number"
                  value={formData.expectedProfit}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedProfit: e.target.value }))}
                  className="input-field"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (months)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="input-field"
                  placeholder="6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                rows="3"
                placeholder="Describe the investment project..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create Investment'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investments List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Investment Portfolio</h2>
        <div className="grid grid-cols-1 gap-6">
          {investments.map(investment => (
            <InvestmentCard key={investment._id} investment={investment} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Investments;