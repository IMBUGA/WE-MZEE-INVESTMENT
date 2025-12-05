import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { contributionsAPI } from '../services/api';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

function Contributions() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'mpesa',
    transactionId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      const data = user.role === 'member' 
        ? await contributionsAPI.getMy()
        : await contributionsAPI.getAll();
      setContributions(data);
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contributionsAPI.create(formData);
      setFormData({ amount: '', method: 'mpesa', transactionId: '' });
      setShowForm(false);
      await loadContributions();
    } catch (error) {
      console.error('Error creating contribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await contributionsAPI.approve(id);
      await loadContributions();
    } catch (error) {
      console.error('Error approving contribution:', error);
    }
  };

  const StatusIcon = ({ status }) => {
    const icons = {
      approved: <CheckCircle className="h-5 w-5 text-green-500" />,
      rejected: <XCircle className="h-5 w-5 text-red-500" />,
      pending: <Clock className="h-5 w-5 text-yellow-500" />
    };
    return icons[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contributions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Contribution
        </button>
      </div>

      {/* Contribution Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Record New Contribution</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KSh)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="input-field"
                  placeholder="5000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                  className="input-field"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">Paypal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.transactionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                  className="input-field"
                  placeholder="ABC123XYZ"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Submitting...' : 'Submit Contribution'}
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

      {/* Contributions List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          {user.role === 'member' ? 'My Contributions' : 'All Contributions'}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {user.role !== 'member' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {user.role !== 'member' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contributions.map(contribution => (
                <tr key={contribution._id}>
                  {user.role !== 'member' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contribution.member?.name}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    KSh {contribution.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {contribution.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(contribution.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon status={contribution.status} />
                      <span className="ml-2 capitalize">{contribution.status}</span>
                    </div>
                  </td>
                  {user.role !== 'member' && contribution.status === 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleApprove(contribution._id)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Approve
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Contributions;