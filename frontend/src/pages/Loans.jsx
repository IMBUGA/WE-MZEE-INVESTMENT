import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loansAPI } from '../services/api';
import { Plus, CheckCircle, Clock, AlertCircle, DollarSign, Calendar } from 'lucide-react';

function Loans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRepaymentForm, setShowRepaymentForm] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    duration: '6',
    interestRate: '0.08'
  });
  const [repaymentData, setRepaymentData] = useState({
    amount: '',
    method: 'mpesa',
    transactionId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const data = user.role === 'member' 
        ? await loansAPI.getMy()
        : await loansAPI.getAll();
      setLoans(data);
    } catch (error) {
      console.error('Error loading loans:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + parseInt(formData.duration));
      
      await loansAPI.create({
        ...formData,
        dueDate: dueDate.toISOString(),
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate)
      });
      
      setFormData({ amount: '', purpose: '', duration: '6', interestRate: '0.08' });
      setShowForm(false);
      await loadLoans();
    } catch (error) {
      console.error('Error creating loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayment = async (loanId, e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loansAPI.addRepayment(loanId, {
        ...repaymentData,
        amount: parseFloat(repaymentData.amount)
      });
      
      setRepaymentData({ amount: '', method: 'mpesa', transactionId: '' });
      setShowRepaymentForm(null);
      await loadLoans();
    } catch (error) {
      console.error('Error adding repayment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId) => {
    try {
      await loansAPI.approve(loanId);
      await loadLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      approved: <CheckCircle className="h-5 w-5 text-green-500" />,
      pending: <Clock className="h-5 w-5 text-yellow-500" />,
      active: <DollarSign className="h-5 w-5 text-blue-500" />,
      completed: <CheckCircle className="h-5 w-5 text-green-500" />,
      defaulted: <AlertCircle className="h-5 w-5 text-red-500" />
    };
    return icons[status] || <Clock className="h-5 w-5 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      defaulted: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotalAmount = (loan) => {
    return loan.amount + (loan.amount * loan.interestRate);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Loans Management</h1>
        {user.role === 'member' && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Apply for Loan
          </button>
        )}
      </div>

      {/* Loan Application Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Apply for Loan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount (KSh)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="input-field"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Business capital, Emergency, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (months)
                </label>
                <select
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="input-field"
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.interestRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                  className="input-field"
                  placeholder="8%"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Submitting...' : 'Apply for Loan'}
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

      {/* Loans List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          {user.role === 'member' ? 'My Loans' : 'All Loans'}
        </h2>
        <div className="space-y-4">
          {loans.map(loan => (
            <div key={loan._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    KSh {loan.amount?.toLocaleString()}
                  </h3>
                  <p className="text-gray-600">{loan.purpose}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                  {getStatusIcon(loan.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold">KSh {calculateTotalAmount(loan).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Interest Rate</p>
                  <p className="font-semibold">{(loan.interestRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount Repaid</p>
                  <p className="font-semibold">KSh {loan.totalRepaid?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Balance</p>
                  <p className="font-semibold">KSh {loan.remainingBalance?.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2">
                  {user.role !== 'member' && loan.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(loan._id)}
                      className="text-green-600 hover:text-green-900 font-medium"
                    >
                      Approve
                    </button>
                  )}
                  
                  {loan.status === 'active' && (
                    <button
                      onClick={() => setShowRepaymentForm(loan._id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Make Repayment
                    </button>
                  )}
                </div>
              </div>

              {/* Repayment Form */}
              {showRepaymentForm === loan._id && (
                <div className="mt-4 p-4 border-t">
                  <h4 className="font-semibold mb-3">Make Repayment</h4>
                  <form onSubmit={(e) => handleRepayment(loan._id, e)} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="number"
                      required
                      placeholder="Amount"
                      value={repaymentData.amount}
                      onChange={(e) => setRepaymentData(prev => ({ ...prev, amount: e.target.value }))}
                      className="input-field"
                    />
                    <select
                      required
                      value={repaymentData.method}
                      onChange={(e) => setRepaymentData(prev => ({ ...prev, method: e.target.value }))}
                      className="input-field"
                    >
                      <option value="mpesa">M-Pesa</option>
                      <option value="bank">Bank</option>
                      <option value="cash">Cash</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Transaction ID"
                      value={repaymentData.transactionId}
                      onChange={(e) => setRepaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                      className="input-field"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1"
                      >
                        Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRepaymentForm(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Repayments History */}
              {loan.repayments && loan.repayments.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-semibold text-sm mb-2">Repayment History</h4>
                  <div className="space-y-2">
                    {loan.repayments.map((repayment, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>KSh {repayment.amount.toLocaleString()} via {repayment.method}</span>
                        <span className="text-gray-500">
                          {new Date(repayment.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Loans;