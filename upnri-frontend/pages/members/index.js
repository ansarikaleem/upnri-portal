import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MembersDirectory() {
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [filters, setFilters] = useState({
    district: '',
    profession: '',
    company: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [connectingMember, setConnectingMember] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMembers();
    fetchConnections();
    fetchSentRequests(); 
  }, []);

  useEffect(() => {
    filterMembers();
  }, [filters, allMembers]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMembers({ 
        limit: 1000 // Get all members
      });
      
      if (response.data) {
        // Filter out administrators and non-active members
        const filteredMembers = response.data.members?.filter(member => 
          member.role !== 'admin' && member.status === 'active'
        ) || [];
        
        setAllMembers(filteredMembers);
        setMembers(filteredMembers);
        
        // Extract unique districts and professions for filters
        const uniqueDistricts = [...new Set(filteredMembers.map(member => member.district).filter(Boolean))].sort();
        const uniqueProfessions = [...new Set(filteredMembers.map(member => member.profession).filter(Boolean))].sort();
        
        setDistricts(uniqueDistricts);
        setProfessions(uniqueProfessions);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await apiService.getConnections();
      setConnections(response.data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchSentRequests = async () => {
  try {
    const response = await apiService.getConnectionRequests({ type: 'sent', status: 'pending' });
    setSentRequests(response.data || []);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
  }
};

  const filterMembers = () => {
    let filtered = [...allMembers];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(member =>
        member.fullName?.toLowerCase().includes(searchTerm) ||
        member.profession?.toLowerCase().includes(searchTerm) ||
        member.company?.toLowerCase().includes(searchTerm) ||
        member.district?.toLowerCase().includes(searchTerm) ||
        member.area?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply other filters
    if (filters.district) {
      filtered = filtered.filter(member => member.district === filters.district);
    }

    if (filters.profession) {
      filtered = filtered.filter(member => member.profession === filters.profession);
    }

    if (filters.company) {
      filtered = filtered.filter(member => 
        member.company?.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    setMembers(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      district: '',
      profession: '',
      company: '',
      search: ''
    });
  };

  const handleViewProfile = (memberId) => {
    // Navigate to member profile page
    router.push(`/members/${memberId}`);
  };

  const handleConnect = (member) => {
    setConnectingMember(member);
    setConnectMessage('');
    setShowConnectModal(true);
  };

  const sendConnectionRequest = async () => {
    if (!connectMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSendingMessage(true);
      
      await apiService.sendConnectionRequest({
        toMemberId: connectingMember.id,
        message: connectMessage
      });
      
      alert(`Connection request sent to ${connectingMember.fullName}!`);
      setShowConnectModal(false);
      setConnectMessage('');
      setConnectingMember(null);
      
      // Refresh connections and unread count
      fetchConnections();
      fetchSentRequests();
      if (typeof window !== 'undefined' && window.updateUnreadConnectionCount) {
        window.updateUnreadConnectionCount();
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert(error.response?.data?.error || 'Failed to send connection request. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Check if member is already connected
  const isMemberConnected = (memberId) => {
    return connections.some(connection => connection.member.id === memberId);
  };

  // Check if connection request is pending (sent by current user)
  const isConnectionPending = (memberId) => {
    return sentRequests.some(request => request.toMemberId === memberId);
  };
  const isConnectionRejected = (memberId) => {
  // This would require additional API call to check rejected requests
  // For now, we'll assume we don't have this data
  return false;
};

  const hasActiveFilters = filters.district || filters.profession || filters.company || filters.search;

  return (
    <PrivateRoute>
      <Layout>
        <Head>
          <title>Members Directory - UPNRI Forum Kuwait</title>
          <meta name="description" content="Connect with fellow UPNRI community members in Kuwait" />
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Members Directory</h1>
              <p className="text-gray-600">Connect with fellow community members in Kuwait</p>
              <div className="mt-2 text-sm text-gray-500">
                {allMembers.length} active members in our community
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Members
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by name, profession, company, district..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      fetchMembers();
                      fetchConnections();
                      fetchSentRequests();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Refresh
                  </button>
                  <Link
                    href="/members/connections"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    My Connections
                    {connections.length > 0 && (
                      <span className="ml-2 bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {connections.length}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Districts</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession
                  </label>
                  <select
                    value={filters.profession}
                    onChange={(e) => handleFilterChange('profession', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Professions</option>
                    {professions.map(profession => (
                      <option key={profession} value={profession}>{profession}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    placeholder="Filter by company..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Active filters display */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.district && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      District: {filters.district}
                      <button
                        onClick={() => handleFilterChange('district', '')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.profession && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Profession: {filters.profession}
                      <button
                        onClick={() => handleFilterChange('profession', '')}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.company && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Company: {filters.company}
                      <button
                        onClick={() => handleFilterChange('company', '')}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Search: {filters.search}
                      <button
                        onClick={() => handleFilterChange('search', '')}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Summary */}
            {!loading && (
              <div className="mb-4 text-sm text-gray-600">
                Showing {members.length} of {allMembers.length} members
                {hasActiveFilters && ' (filtered)'}
              </div>
            )}

            {/* Members Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading members...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {members.map((member) => {
                    const isConnected = isMemberConnected(member.id);
                    const isPending = isConnectionPending(member.id);
                    return (
                      <div key={member.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            {member.profileImage ? (
                              <img 
                                src={member.profileImage} 
                                alt={member.fullName}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full rounded-full flex items-center justify-center bg-gray-200 ${member.profileImage ? 'hidden' : 'flex'}`}>
                              <span className="text-gray-500 text-lg font-semibold">
                                {member.fullName?.charAt(0) || 'M'}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
  <h3 className="font-semibold text-gray-900 truncate">{member.fullName}</h3>
  <p className="text-blue-600 text-sm truncate">{member.profession}</p>
  <div className="flex flex-wrap gap-1 mt-1">
    {member.isOfficeBearer && (
      <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
        {member.officeBearerPosition || 'Office Bearer'}
      </span>
    )}
    {isConnected && (
      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Connected
      </span>
    )}
    {isPending && (
      <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
        Request Sent
      </span>
    )}
  </div>
</div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start">
                            <span className="w-16 font-medium text-gray-500">District:</span>
                            <span className="flex-1">{member.district}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-16 font-medium text-gray-500">Area:</span>
                            <span className="flex-1">{member.area}</span>
                          </div>
                          {member.company && (
                            <div className="flex items-start">
                              <span className="w-16 font-medium text-gray-500">Company:</span>
                              <span className="flex-1 truncate">{member.company}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
  <button 
    onClick={() => handleViewProfile(member.id)}
    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
  >
    View Profile
  </button>
  
  {isConnected ? (
    <button 
      disabled
      className="px-3 py-2 border border-green-300 text-green-700 bg-green-50 rounded-md text-sm cursor-default flex items-center"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Connected
    </button>
  ) : isPending ? (
    <button 
      disabled
      className="px-3 py-2 border border-yellow-300 text-yellow-700 bg-yellow-50 rounded-md text-sm cursor-default flex items-center"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Pending
    </button>
  ) : (
    <button 
      onClick={() => handleConnect(member)}
      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
    >
      Connect
    </button>
  )}
</div>

                      </div>
                    );
                  })}
                </div>

                {members.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">No members found matching your criteria.</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Try adjusting your search terms or filters to see more results.
                    </p>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Connect Modal */}
        {showConnectModal && connectingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Connect with {connectingMember.fullName}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Send a connection request to {connectingMember.fullName}. They will receive your message and can choose to respond.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    placeholder={`Hi ${connectingMember.fullName}, I'd like to connect with you...`}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowConnectModal(false);
                      setConnectingMember(null);
                      setConnectMessage('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendConnectionRequest}
                    disabled={sendingMessage || !connectMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </PrivateRoute>
  );
}