import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';
import { useRouter } from 'next/router';

export default function MemberProfileView() {
  const [member, setMember] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectMessage, setConnectMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('not_connected'); // not_connected, connected, pending
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchMemberProfile();
      fetchConnections();
    }
  }, [id]);

  const fetchMemberProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getMembers({ limit: 1000 });
      
      if (response.data?.members) {
        const foundMember = response.data.members.find(m => m.id === parseInt(id));
        
        if (foundMember && foundMember.role !== 'admin' && foundMember.status === 'active') {
          setMember(foundMember);
        } else {
          setError('Member not found or profile is not available');
        }
      }
    } catch (error) {
      console.error('Error fetching member profile:', error);
      setError('Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await apiService.getConnections();
      setConnections(response.data || []);
      
      // Check if current member is connected
      const isConnected = response.data?.some(conn => conn.member.id === parseInt(id));
      setConnectionStatus(isConnected ? 'connected' : 'not_connected');
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleConnect = async () => {
    if (!connectMessage.trim()) {
      alert('Please enter a connection message');
      return;
    }

    try {
      setSendingMessage(true);
      
      await apiService.sendConnectionRequest({
        toMemberId: member.id,
        message: connectMessage
      });
      
      alert(`Connection request sent to ${member.fullName}!`);
      setConnectMessage('');
      setShowConnectForm(false);
      setConnectionStatus('pending');
      
      // Refresh unread count
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

  const handleBack = () => {
    router.back();
  };

  // Generate fancy connection message templates
  const connectionTemplates = [
    "Hello! I came across your profile and was impressed by your background in {profession}. I'd love to connect and learn more about your experiences in Kuwait.",
    "Hi there! As fellow members of the UPNRI community in Kuwait, I thought it would be great to connect and potentially share insights about our professional journeys.",
    "Greetings! I noticed we share similar interests in {interests}. Would be wonderful to connect and exchange thoughts with a fellow community member.",
    "Hello! Your profile caught my attention, especially your experience in {profession}. I believe we could have some valuable conversations as part of the UPNRI network.",
    "Warm greetings! Being part of the same community in Kuwait, I'd be delighted to connect and explore potential synergies between our professional paths."
  ];

  const getRandomTemplate = () => {
    const template = connectionTemplates[Math.floor(Math.random() * connectionTemplates.length)];
    return template
      .replace('{profession}', member?.profession || 'your field')
      .replace('{interests}', member?.interests ? member.interests.split(',')[0] : 'common interests');
  };

  const fillWithTemplate = () => {
    setConnectMessage(getRandomTemplate());
  };

  if (loading) {
    return (
      <PrivateRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </Layout>
      </PrivateRoute>
    );
  }

  if (error || !member) {
    return (
      <PrivateRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Available</h2>
              <p className="text-gray-600 mb-4">{error || 'The member profile you are looking for is not available.'}</p>
              <button
                onClick={handleBack}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Directory
              </button>
            </div>
          </div>
        </Layout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <Layout>
        <Head>
          <title>{member.fullName} - UPNRI Forum Kuwait</title>
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Directory
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Profile Content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          {member.profileImage ? (
                            <img 
                              src={member.profileImage} 
                              alt={member.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-semibold">
                              {member.fullName?.charAt(0) || 'M'}
                            </span>
                          )}
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold">{member.fullName}</h1>
                          <p className="text-blue-100">{member.profession}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {member.isOfficeBearer && (
                              <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                                {member.officeBearerPosition || 'Office Bearer'}
                              </span>
                            )}
                            {connectionStatus === 'connected' && (
                              <span className="inline-block px-3 py-1 bg-green-500 bg-opacity-20 rounded-full text-sm">
                                ✓ Connected
                              </span>
                            )}
                            {connectionStatus === 'pending' && (
                              <span className="inline-block px-3 py-1 bg-yellow-500 bg-opacity-20 rounded-full text-sm">
                                ⏳ Request Sent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {connectionStatus === 'not_connected' && (
                        <button
                          onClick={() => setShowConnectForm(!showConnectForm)}
                          className="bg-white text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 font-medium"
                        >
                          {showConnectForm ? 'Cancel' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                            <p className="text-gray-900">{member.district}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Area in Kuwait</label>
                            <p className="text-gray-900">{member.area}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                            <p className="text-gray-900">{member.profession}</p>
                          </div>
                        </div>
                        
                        {member.company && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                              <p className="text-gray-900">{member.company}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                        
                        {member.qualifications && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                            <p className="text-gray-900 whitespace-pre-line">{member.qualifications}</p>
                          </div>
                        )}
                        
                        {member.specialty && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                            <p className="text-gray-900">{member.specialty}</p>
                          </div>
                        )}
                        
                        {member.professionalInterests && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Interests</label>
                            <p className="text-gray-900 whitespace-pre-line">{member.professionalInterests}</p>
                          </div>
                        )}
                        
                        {member.interests && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Personal Interests</label>
                            <p className="text-gray-900 whitespace-pre-line">{member.interests}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Profile */}
                    {member.professionalProfile && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Professional Profile</h3>
                        <p className="text-gray-900 whitespace-pre-line leading-relaxed">{member.professionalProfile}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar - Connect Form */}
              <div className="lg:col-span-1">
                {connectionStatus === 'not_connected' && showConnectForm && (
                  <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect with {member.fullName}</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message
                        <span className="text-xs text-gray-500 ml-1">(required)</span>
                      </label>
                      <textarea
                        value={connectMessage}
                        onChange={(e) => setConnectMessage(e.target.value)}
                        placeholder="Introduce yourself and share why you'd like to connect..."
                        rows="6"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="mb-4">
                      <button
                        onClick={fillWithTemplate}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        ✨ Use a professional template
                      </button>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleConnect}
                        disabled={sendingMessage || !connectMessage.trim()}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {sendingMessage ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending Request...
                          </span>
                        ) : (
                          'Send Connection Request'
                        )}
                      </button>
                      
                      <div className="text-xs text-gray-500 text-center">
                        Your request will be sent to {member.fullName} for approval
                      </div>
                    </div>
                  </div>
                )}

                {connectionStatus === 'connected' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Connected</h3>
                    <p className="text-green-700 text-sm mb-4">
                      You are connected with {member.fullName}. You can message them through your connections.
                    </p>
                    <button
                      onClick={() => router.push('/members/connections')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium text-sm"
                    >
                      View My Connections
                    </button>
                  </div>
                )}

                {connectionStatus === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Request Sent</h3>
                    <p className="text-yellow-700 text-sm">
                      Your connection request is pending approval from {member.fullName}.
                    </p>
                  </div>
                )}

                {/* Member Stats Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-green-600">Active Member</span>
                    </div>
                    {member.isOfficeBearer && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Role</span>
                        <span className="text-sm font-medium text-orange-600">Office Bearer</span>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <button
                        onClick={() => router.push('/members')}
                        className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        ← Back to Members Directory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PrivateRoute>
  );
}