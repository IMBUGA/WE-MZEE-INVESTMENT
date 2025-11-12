import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { membersAPI } from '../services/api';
import { User, Mail, Phone, UserCheck, Calendar, Edit, Save, X } from 'lucide-react';

function Profile() {
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nextOfKin: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    loadMemberData();
  }, [user]);

  const loadMemberData = async () => {
    try {
      const memberData = await membersAPI.getById(user.id);
      setMember(memberData);
      setFormData({
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        nextOfKin: memberData.nextOfKin || {
          name: '',
          relationship: '',
          phone: ''
        }
      });
    } catch (error) {
      console.error('Error loading member data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await membersAPI.update(user.id, formData);
      await loadMemberData();
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      nextOfKin: member.nextOfKin || {
        name: '',
        relationship: '',
        phone: ''
      }
    });
    setEditMode(false);
  };

  if (!member) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-gray-50">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{member.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{member.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-gray-50">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{member.idNumber}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Date
                </label>
                <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-gray-50">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </form>
          </div>

          {/* Next of Kin Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Next of Kin Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.nextOfKin.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nextOfKin: { ...prev.nextOfKin, name: e.target.value }
                    }))}
                    className="input-field"
                  />
                ) : (
                  <div className="p-2 border border-gray-300 rounded-lg bg-gray-50">
                    {member.nextOfKin?.name || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                {editMode ? (
                  <select
                    value={formData.nextOfKin.relationship}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nextOfKin: { ...prev.nextOfKin, relationship: e.target.value }
                    }))}
                    className="input-field"
                  >
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="p-2 border border-gray-300 rounded-lg bg-gray-50 capitalize">
                    {member.nextOfKin?.relationship || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.nextOfKin.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nextOfKin: { ...prev.nextOfKin, phone: e.target.value }
                    }))}
                    className="input-field"
                  />
                ) : (
                  <div className="p-2 border border-gray-300 rounded-lg bg-gray-50">
                    {member.nextOfKin?.phone || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Member Role</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                  {member.role}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Account Status</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${
                  member.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : member.status === 'inactive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {member.status}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
                <p className="text-2xl font-bold text-primary-600">
                  KSh {member.totalContributions?.toLocaleString() || 0}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Profits</p>
                <p className="text-2xl font-bold text-green-600">
                  KSh {member.totalProfits?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Download Member Statement
              </button>
              <button className="w-full btn-secondary">
                Change Password
              </button>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;