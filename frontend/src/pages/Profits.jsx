import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profitsAPI, membersAPI } from '../services/api';
import { Plus, DollarSign, Calendar, Users, Share2 } from 'lucide-react';

function Profits() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [myDistributions, setMyDistributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    period: '',
    totalProfit: '',
    distributionDate: new Date().toISOString().split('T')[0],
    distributions: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user.role !== 'member') {
        const [allDistributions, allMembers] = await Promise.all([
          profitsAPI.getAll(),
          membersAPI.getAll()
        ]);
        setDistributions(allDistributions);
        setMembers(allMembers);
      } else {
        const myDist = await profitsAPI.getMy();
        setMyDistributions(myDist);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profitsAPI.create({
        ...formData,
        totalProfit: parseFloat(formData.totalProfit),
        distributionDate: new Date(formData.distributionDate).toISOString()
      });
      
      setFormData({
        period: '',
        totalProfit: '',
        distributionDate: new Date().toISOString().split('T')[0],
        distributions: [],
        notes: ''
      });
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEqualShare = () => {
    if (!formData.totalProfit || members.length === 0) return;
    
    const sharePerMember = parseFloat(formData.totalProfit) / members.length;
    const distributions = members.map(member => ({
      member: member._id,
      amount: sharePerMember,
      sharePercentage: (1 / members.length) * 100
    }));

    setFormData(prev => ({
      ...prev,
      distributions
    }));
  };

  const DistributionCard = ({ distribution, isMyView = false }) => (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{distribution.period}</h3>
          <p className="text-gray-600">
            Distributed on {new Date(distribution.distributionDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            KSh {distribution.totalProfit?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Profit</p>
        </div>
      </div>

      {isMyView ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Your Share</p>
              <p className="text-2xl font-bold text-green-600">
                KSh {distribution.myDistribution.amount.toLocaleString()}
              </p>
            </div>
            <Share2 className="h-8 w-8 text-green-600" />
          </div>
          {distribution.myDistribution.reinvested && (
            <p className="text-sm text-green-700 mt-2">
              KSh {distribution.myDistribution.reinvestmentAmount.toLocaleString()} reinvested
            </p>
          )}
        </div>
      ) : (
        <div>
          <h4 className="font-semibold mb-3">Distribution Breakdown</h4>
          <div className="space-y-2">
            {distribution.distributions.slice(0, 5).map((dist, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{dist.member.name}</span>
                <div className="text-right">
                  <p className="font-semibold">KSh {dist.amount.toLocaleString()}</p>
                  <p className="text-gray-500">{dist.sharePercentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            {distribution.distributions.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                +{distribution.distributions.length - 5} more members
              </p>
            )}
          </div>
        </div>
      )}

      {distribution.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{distribution.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profit Distribution</h1>
        {user.role !== 'member' && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Distribution
          </button>
        )}
      </div>

      {/* Distribution Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create Profit Distribution</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <input
                  type="text"
                  required
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Q3 2024, Annual 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Profit (KSh)
                </label>
                <input
                  type="number"
                  required
                  value={formData.totalProfit}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalProfit: e.target.value }))}
                  className="input-field"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distribution Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.distributionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, distributionDate: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-field"
                rows="3"
                placeholder="Additional notes about this distribution..."
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">
                  {members.length} members will receive equal shares
                </p>
                <p className="text-sm text-blue-700">
                  Click calculate to distribute profit equally among all members
                </p>
              </div>
              <button
                type="button"
                onClick={calculateEqualShare}
                className="btn-primary"
                disabled={!formData.totalProfit}
              >
                Calculate Equal Shares
              </button>
            </div>

            {formData.distributions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Distribution Preview</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.distributions.map((dist, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <span>{members.find(m => m._id === dist.member)?.name}</span>
                      <div className="text-right">
                        <p className="font-semibold">KSh {dist.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{dist.sharePercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || formData.distributions.length === 0}
                className="btn-primary"
              >
                {loading ? 'Distributing...' : 'Distribute Profits'}
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

      {/* Distributions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          {user.role === 'member' ? 'My Profit Distributions' : 'All Distributions'}
        </h2>
        
        {user.role === 'member' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDistributions.map(distribution => (
              <DistributionCard 
                key={distribution._id} 
                distribution={distribution} 
                isMyView={true}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {distributions.map(distribution => (
              <DistributionCard key={distribution._id} distribution={distribution} />
            ))}
          </div>
        )}

        {(user.role === 'member' ? myDistributions.length : distributions.length) === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No distributions yet</h3>
            <p className="text-gray-500">
              {user.role === 'member' 
                ? 'You haven\'t received any profit distributions yet.'
                : 'No profit distributions have been created yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profits;