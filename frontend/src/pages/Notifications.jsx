import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import { Bell, Mail, MessageSquare, Send, Users, Calendar } from 'lucide-react';

function Notifications() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: '',
    message: ''
  });
  const [reminderForm, setReminderForm] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadNotificationStats();
  }, []);

  const loadNotificationStats = async () => {
    try {
      const statsData = await notificationsAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await notificationsAPI.sendBroadcast(broadcastForm);
      alert('Broadcast message sent successfully!');
      setBroadcastForm({ subject: '', message: '' });
      await loadNotificationStats();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Error sending broadcast message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendContributionReminders = async () => {
    setLoading(true);
    
    try {
      await notificationsAPI.sendContributionReminders(reminderForm);
      alert('Contribution reminders sent successfully!');
      await loadNotificationStats();
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Error sending reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendLoanReminders = async () => {
    setLoading(true);
    
    try {
      await notificationsAPI.sendLoanRepaymentReminders();
      alert('Loan repayment reminders sent successfully!');
      await loadNotificationStats();
    } catch (error) {
      console.error('Error sending loan reminders:', error);
      alert('Error sending loan reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notifications & Communications</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalMembers || 0}</p>
          <p className="text-sm text-gray-600">Total Members</p>
        </div>
        
        <div className="card text-center">
          <Bell className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.pendingContributions || 0}</p>
          <p className="text-sm text-gray-600">Pending Contributions</p>
        </div>
        
        <div className="card text-center">
          <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.pendingLoans || 0}</p>
          <p className="text-sm text-gray-600">Pending Loans</p>
        </div>
        
        <div className="card text-center">
          <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.upcomingLoanRepayments || 0}</p>
          <p className="text-sm text-gray-600">Due Loans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Message Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Broadcast Message
          </h2>
          
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={broadcastForm.subject}
                onChange={(e) => setBroadcastForm(prev => ({ ...prev, subject: e.target.value }))}
                className="input-field"
                placeholder="Important group update..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                required
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                className="input-field"
                rows="6"
                placeholder="Type your message to all members..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send to All Members'}
            </button>
          </form>
        </div>

        {/* Automated Reminders */}
        <div className="space-y-6">
          {/* Contribution Reminders */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Contribution Reminders
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={reminderForm.month}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, month: e.target.value }))}
                    className="input-field"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={reminderForm.year}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, year: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <button
                onClick={sendContributionReminders}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                Send Contribution Reminders
              </button>
            </div>
          </div>

          {/* Loan Repayment Reminders */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Loan Repayment Reminders
            </h2>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Send automated reminders to members with upcoming loan repayments.
                The system will notify members whose loans are due within 7 days.
              </p>
              
              <button
                onClick={sendLoanReminders}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                Send Loan Repayment Reminders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification History & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Contribution Reminders Sent</p>
              <p className="text-sm text-gray-600">December 2023 - 24 members notified</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Group Meeting Announcement</p>
              <p className="text-sm text-gray-600">Quarterly general meeting details</p>
              <p className="text-xs text-gray-500">1 week ago</p>
            </div>
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Best Practices</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Send contribution reminders at the beginning of each month</li>
            <li>• Use broadcast messages for important group announcements</li>
            <li>• Loan reminders are automatically sent for due dates within 7 days</li>
            <li>• Keep messages clear and concise for better engagement</li>
            <li>• Use appropriate subjects to help members prioritize reading</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Notifications;