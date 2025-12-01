import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMembers();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      };

      const response = await apiService.getAdminMembers(params);
      setMembers(response.data.members);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberStatus = async (memberId, newStatus) => {
    try {
      await apiService.updateMemberStatus(memberId, newStatus);
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error('Error updating member status:', error);
      alert('Failed to update member status');
    }
  };

  const handleRoleUpdate = async (memberId, field, value) => {
    try {
      setSaving(true);
      const updateData = { [field]: value };
      
      // Convert string to boolean for isOfficeBearer
      if (field === 'isOfficeBearer') {
        updateData.isOfficeBearer = value === 'true';
      }
      
      // Convert string to number for officeBearerOrder
      if (field === 'officeBearerOrder') {
        updateData.officeBearerOrder = parseInt(value) || 0;
      }

      await apiService.updateMemberRole(memberId, updateData);
      
      // Update local state
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, ...updateData }
          : member
      ));
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Failed to update member role');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName || '',
      civilId: member.civilId || '',
      email: member.email || '',
      phone: member.phone || '',
      gender: member.gender || 'male',
      district: member.district || '',
      area: member.area || '',
      profession: member.profession || '',
      company: member.company || '',
      profileImage: member.profileImage || '',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      spouseName: member.spouseName || '',
      childrenInfo: member.childrenInfo || '',
      anniversary: member.anniversary ? member.anniversary.split('T')[0] : '',
      interests: member.interests || '',
      qualifications: member.qualifications || '',
      specialty: member.specialty || '',
      professionalInterests: member.professionalInterests || '',
      professionalProfile: member.professionalProfile || '',
      status: member.status || 'pending',
      role: member.role || 'member',
      isOfficeBearer: member.isOfficeBearer || false,
      officeBearerPosition: member.officeBearerPosition || '',
      officeBearerOrder: member.officeBearerOrder || 0
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiService.updateMember(editingMember.id, formData);
      
      // Update local state
      setMembers(prev => prev.map(member => 
        member.id === editingMember.id 
          ? { ...member, ...formData }
          : member
      ));
      
      setEditingMember(null);
      setFormData({});
      alert('Member updated successfully!');
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMembers();
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const RoleBadge = ({ role }) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      editor: 'bg-indigo-100 text-indigo-800',
      member: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role]}`}>
        {role}
      </span>
    );
  };

  const OfficeBearerBadge = ({ isOfficeBearer, position }) => {
    if (!isOfficeBearer) return null;
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        {position || 'Office Bearer'}
      </span>
    );
  };

  return (
    <PrivateRoute adminOnly>
      <AdminLayout>
        <Head>
          <title>Manage Members - Admin Panel</title>
        </Head>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Members</h1>
            <p className="text-gray-600">Approve, suspend, or manage member accounts and roles</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Members
                </label>
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or civil ID..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Search
                  </button>
                </form>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchMembers}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading members...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role & Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map((member) => (
                        <React.Fragment key={member.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  {member.profileImage ? (
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={member.profileImage}
                                      alt={member.fullName}
                                    />
                                  ) : (
                                    <span className="text-gray-500 font-medium">
                                      {member.fullName.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {member.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {member.district}, {member.area}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {member.profession}
                                    {member.company && ` at ${member.company}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{member.email}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                              <div className="text-sm text-gray-500">CID: {member.civilId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={member.status} />
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(member.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleRoleUpdate(member.id, 'role', e.target.value)}
                                    disabled={saving}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="member">Member</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <RoleBadge role={member.role} />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={member.isOfficeBearer?.toString() || 'false'}
                                    onChange={(e) => handleRoleUpdate(member.id, 'isOfficeBearer', e.target.value)}
                                    disabled={saving}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="false">Regular</option>
                                    <option value="true">Office Bearer</option>
                                  </select>
                                  <OfficeBearerBadge 
                                    isOfficeBearer={member.isOfficeBearer} 
                                    position={member.officeBearerPosition} 
                                  />
                                </div>

                                {member.isOfficeBearer && (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      placeholder="Position"
                                      value={member.officeBearerPosition || ''}
                                      onChange={(e) => handleRoleUpdate(member.id, 'officeBearerPosition', e.target.value)}
                                      disabled={saving}
                                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                      type="number"
                                      placeholder="Order"
                                      value={member.officeBearerOrder || 0}
                                      onChange={(e) => handleRoleUpdate(member.id, 'officeBearerOrder', e.target.value)}
                                      disabled={saving}
                                      className="text-xs w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  {member.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => updateMemberStatus(member.id, 'active')}
                                        disabled={saving}
                                        className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-2 py-1 rounded"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => updateMemberStatus(member.id, 'suspended')}
                                        disabled={saving}
                                        className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {member.status === 'active' && (
                                    <button
                                      onClick={() => updateMemberStatus(member.id, 'suspended')}
                                      disabled={saving}
                                      className="text-yellow-600 hover:text-yellow-900 text-xs bg-yellow-50 px-2 py-1 rounded"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                  {member.status === 'suspended' && (
                                    <button
                                      onClick={() => updateMemberStatus(member.id, 'active')}
                                      disabled={saving}
                                      className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-2 py-1 rounded"
                                    >
                                      Activate
                                    </button>
                                  )}
                                  <button
                                    onClick={() => updateMemberStatus(member.id, 'archived')}
                                    disabled={saving}
                                    className="text-gray-600 hover:text-gray-900 text-xs bg-gray-50 px-2 py-1 rounded"
                                  >
                                    Archive
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => handleEditMember(member)}
                                  disabled={saving}
                                  className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded text-left"
                                >
                                  {editingMember?.id === member.id ? 'Cancel Edit' : 'Edit Full Details'}
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Edit Form */}
                          {editingMember?.id === member.id && (
                            <tr className="bg-blue-50">
                              <td colSpan="5" className="px-6 py-4">
                                <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
                                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                                    Edit Member: {member.fullName}
                                  </h4>
                                  <form onSubmit={handleSaveMember}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                      {/* Basic Information */}
                                      <div className="space-y-4">
                                        <h5 className="font-medium text-gray-700 border-b pb-2">Basic Information</h5>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => handleFormChange('fullName', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Civil ID *
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.civilId}
                                            onChange={(e) => handleFormChange('civilId', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                          </label>
                                          <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleFormChange('email', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone *
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => handleFormChange('phone', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender *
                                          </label>
                                          <select
                                            value={formData.gender}
                                            onChange={(e) => handleFormChange('gender', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                          </select>
                                        </div>
                                      </div>

                                      {/* Location & Profession */}
                                      <div className="space-y-4">
                                        <h5 className="font-medium text-gray-700 border-b pb-2">Location & Profession</h5>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            District *
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => handleFormChange('district', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Area in Kuwait *
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.area}
                                            onChange={(e) => handleFormChange('area', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Profession *
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.profession}
                                            onChange={(e) => handleFormChange('profession', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => handleFormChange('company', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                      </div>

                                      {/* Admin Controls */}
                                      <div className="space-y-4">
                                        <h5 className="font-medium text-gray-700 border-b pb-2">Admin Controls</h5>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                          </label>
                                          <select
                                            value={formData.status}
                                            onChange={(e) => handleFormChange('status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="pending">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="archived">Archived</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                          </label>
                                          <select
                                            value={formData.role}
                                            onChange={(e) => handleFormChange('role', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="member">Member</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Office Bearer
                                          </label>
                                          <select
                                            value={formData.isOfficeBearer?.toString()}
                                            onChange={(e) => handleFormChange('isOfficeBearer', e.target.value === 'true')}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                          </select>
                                        </div>
                                        {formData.isOfficeBearer && (
                                          <>
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Position
                                              </label>
                                              <input
                                                type="text"
                                                value={formData.officeBearerPosition}
                                                onChange={(e) => handleFormChange('officeBearerPosition', e.target.value)}
                                                placeholder="e.g., President, Secretary"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Display Order
                                              </label>
                                              <input
                                                type="number"
                                                value={formData.officeBearerOrder}
                                                onChange={(e) => handleFormChange('officeBearerOrder', parseInt(e.target.value) || 0)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              />
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                      <div className="space-y-4">
                                        <h5 className="font-medium text-gray-700 border-b pb-2">Personal Information</h5>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Profile Image URL
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.profileImage}
                                            onChange={(e) => handleFormChange('profileImage', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Birth
                                          </label>
                                          <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Spouse Name
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.spouseName}
                                            onChange={(e) => handleFormChange('spouseName', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Anniversary
                                          </label>
                                          <input
                                            type="date"
                                            value={formData.anniversary}
                                            onChange={(e) => handleFormChange('anniversary', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <h5 className="font-medium text-gray-700 border-b pb-2">Professional & Interests</h5>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Qualifications
                                          </label>
                                          <textarea
                                            value={formData.qualifications}
                                            onChange={(e) => handleFormChange('qualifications', e.target.value)}
                                            rows="2"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Specialty
                                          </label>
                                          <input
                                            type="text"
                                            value={formData.specialty}
                                            onChange={(e) => handleFormChange('specialty', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Professional Interests
                                          </label>
                                          <textarea
                                            value={formData.professionalInterests}
                                            onChange={(e) => handleFormChange('professionalInterests', e.target.value)}
                                            rows="2"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Personal Interests
                                          </label>
                                          <textarea
                                            value={formData.interests}
                                            onChange={(e) => handleFormChange('interests', e.target.value)}
                                            rows="2"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4 border-t">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMember(null);
                                          setFormData({});
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {members.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No members found.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </AdminLayout>
    </PrivateRoute>
  );
}