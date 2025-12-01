import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';

export default function ConnectionsManagement() {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'received') {
        const response = await apiService.getConnectionRequests({ type: 'received', status: 'pending' });
        setReceivedRequests(response.data);
      } else if (activeTab === 'sent') {
        const response = await apiService.getConnectionRequests({ type: 'sent', status: 'pending' });
        setSentRequests(response.data);
      } else if (activeTab === 'connections') {
        const response = await apiService.getConnections();
        setConnections(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setUpdating(requestId);
      await apiService.acceptConnectionRequest(requestId);
      await fetchData();
      
      // Refresh unread count
      if (typeof window !== 'undefined' && window.updateUnreadConnectionCount) {
        window.updateUnreadConnectionCount();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept connection request');
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setUpdating(requestId);
      await apiService.rejectConnectionRequest(requestId);
      await fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject connection request');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      setUpdating(requestId);
      await apiService.cancelConnectionRequest(requestId);
      await fetchData();
    } catch (error) {
      console.error('Error canceling request:', error);
      alert('Failed to cancel connection request');
    } finally {
      setUpdating(null);
    }
  };

  const tabs = [
    { id: 'received', name: 'Received Requests', count: receivedRequests.length },
    { id: 'sent', name: 'Sent Requests', count: sentRequests.length },
    { id: 'connections', name: 'My Connections', count: connections.length }
  ];

  return (
    <PrivateRoute>
      <Layout>
        <Head>
          <title>Connection Requests - UPNRI Forum Kuwait</title>
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Connection Requests</h1>
              <p className="text-gray-600">Manage your connection requests and connections</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                      {tab.count > 0 && (
                        <span className="ml-2 py-0.5 px-2 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <>
                    {/* Received Requests */}
                    {activeTab === 'received' && (
                      <div className="space-y-4">
                        {receivedRequests.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No pending connection requests
                          </div>
                        ) : (
                          receivedRequests.map((request) => (
                            <div key={request.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  {request.fromMember?.profileImage ? (
                                    <img
                                      src={request.fromMember.profileImage}
                                      alt={request.fromMember.fullName}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-gray-500 font-medium">
                                      {request.fromMember?.fullName?.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{request.fromMember?.fullName}</h3>
                                  <p className="text-sm text-gray-600">{request.fromMember?.profession} • {request.fromMember?.district}</p>
                                  {request.message && (
                                    <p className="text-sm text-gray-500 mt-1">"{request.message}"</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAcceptRequest(request.id)}
                                  disabled={updating === request.id}
                                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                                >
                                  {updating === request.id ? 'Accepting...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(request.id)}
                                  disabled={updating === request.id}
                                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                                >
                                  {updating === request.id ? 'Rejecting...' : 'Reject'}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Sent Requests */}
                    {activeTab === 'sent' && (
                      <div className="space-y-4">
                        {sentRequests.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No sent connection requests
                          </div>
                        ) : (
                          sentRequests.map((request) => (
                            <div key={request.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  {request.toMember?.profileImage ? (
                                    <img
                                      src={request.toMember.profileImage}
                                      alt={request.toMember.fullName}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-gray-500 font-medium">
                                      {request.toMember?.fullName?.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{request.toMember?.fullName}</h3>
                                  <p className="text-sm text-gray-600">{request.toMember?.profession} • {request.toMember?.district}</p>
                                  {request.message && (
                                    <p className="text-sm text-gray-500 mt-1">"{request.message}"</p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">Sent {new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCancelRequest(request.id)}
                                disabled={updating === request.id}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
                              >
                                {updating === request.id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Connections */}
                    {activeTab === 'connections' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connections.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 col-span-2">
                            No connections yet
                          </div>
                        ) : (
                          connections.map((connection) => (
                            <div key={connection.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                  {connection.member?.profileImage ? (
                                    <img
                                      src={connection.member.profileImage}
                                      alt={connection.member.fullName}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-gray-500 font-medium">
                                      {connection.member?.fullName?.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{connection.member?.fullName}</h3>
                                  <p className="text-sm text-blue-600">{connection.member?.profession}</p>
                                  <p className="text-sm text-gray-600">{connection.member?.district}, {connection.member?.area}</p>
                                  {connection.member?.company && (
                                    <p className="text-sm text-gray-500">{connection.member?.company}</p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    Connected {new Date(connection.connectedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PrivateRoute>
  );
}