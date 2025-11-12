import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { membersAPI, contributionsAPI } from '../services/api';
import { Users, Mail, Phone, UserCheck, Calendar, DollarSign, TrendingUp } from 'lucide-react';

function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberStats, setMemberStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const membersData = await membersAPI.getAll();
      setMembers(membersData);

      // Load stats for each member
      const statsPromises = membersData.map(member => 
        membersAPI.getStats(member._id)
      );
      const statsResults = await Promise.all(statsPromises);
      
      const statsMap = {};
      statsResults.forEach((stats, index) => {
        statsMap[membersData[index]._id] = stats;
      });
      setMemberStats(statsMap);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      treasurer: 'bg-blue-100 text-blue-800',
      secretary: 'bg-purple-100 text-purple-800',
      member: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const MemberCard = ({ member }) => {
    const stats = memberStats[member._id] || {};
    
    return (
      <div 
        className="card cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setSelectedMember(member)}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <p className="text-gray-600">{member.email}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
              {member.role}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
              {member.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <UserCheck className="h-4 w-4 mr-2" />
            <span>{member.idNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              KSh {stats.totalContributions?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-600">Contributions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {stats.activeLoans || 0}
            </p>
            <p className="text-xs text-gray-600">Active Loans</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalLoans || 0}
            </p>
            <p className="text-xs text-gray-600">Total Loans</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const MemberDetail = ({ member, onClose }) => {
    const [contributions, setContributions] = useState([]);
    const stats = memberStats[member._id] || {};

    useEffect(() => {
      loadMemberContributions();
    }, [member]);

    const loadMemberContributions = async () => {
      try {
        // For demo purposes, we'll use the getAll and filter
        // In a real app, you'd have a specific endpoint for member contributions
        const allContributions = await contributionsAPI.getAll();
        const memberContributions = allContributions.filter(
          c => c.member?._id === member._id
        );
        setContributions(memberContributions);
      } catch (error) {
        console.error('Error loading member contributions:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
                <p className="text-gray-600">{member.email}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member Information */}
              <div className="lg:col-span-1 space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Member Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{member.idNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                      <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Next of Kin */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Next of Kin</h3>
                  {member.nextOfKin ? (
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {member.nextOfKin.name}</p>
                      <p><strong>Relationship:</strong> {member.nextOfKin.relationship}</p>
                      <p><strong>Phone:</strong> {member.nextOfKin.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No next of kin information</p>
                  )}
                </div>
              </div>

              {/* Statistics and Contributions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="card text-center">
                    <DollarSign className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">KSh {stats.totalContributions?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-600">Total Contributions</p>
                  </div>
                  <div className="card text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">KSh {member.totalProfits?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-600">Total Profits</p>
                  </div>
                  <div className="card text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.activeLoans || 0}</p>
                    <p className="text-sm text-gray-600">Active Loans</p>
                  </div>
                </div>

                {/* Recent Contributions */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Recent Contributions</h3>
                  <div className="space-y-3">
                    {contributions.slice(0, 5).map(contribution => (
                      <div key={contribution._id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">KSh {contribution.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 capitalize">{contribution.method}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium capitalize ${
                            contribution.status === 'approved' ? 'text-green-600' :
                            contribution.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {contribution.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(contribution.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {contributions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No contributions found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
        <div className="text-sm text-gray-600">
          {members.length} total members
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(member => (
          <MemberCard key={member._id} member={member} />
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500">There are no members in the system yet.</p>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetail 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </div>
  );
}

export default Members;