import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import Link from 'next/link';
import { apiService } from '../../utils/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`/api/events?type=${filter}`);
      // const data = await response.json();

      const response = await apiService.getEvents({ limit: 50 });
            // setEvents(response.data.events || response.data || []);
      
      // if (response.ok) {
        setEvents(response.data.events);
      // }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <Head>
        <title>Events - UPNRI Forum Kuwait</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Events</h1>
            <p className="text-gray-600">Join us for exciting community gatherings and activities</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-md font-medium ${
                  filter === 'upcoming'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-md font-medium ${
                  filter === 'past'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Past Events
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Event Date */}
                    <div className="flex-shrink-0 w-20 h-20 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-primary-600 font-bold text-xl">
                        {new Date(event.eventDate).getDate()}
                      </span>
                      <span className="text-primary-600 text-xs uppercase">
                        {new Date(event.eventDate).toLocaleString('en', { month: 'short' })}
                      </span>
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">📅</span>
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center">
                            <span className="mr-2">📍</span>
                            <span>{event.venue}</span>
                          </div>
                        )}
                        {event.maxParticipants && (
                          <div className="flex items-center">
                            <span className="mr-2">👥</span>
                            <span>
                              {event.registrationCount || 0} / {event.maxParticipants} registered
                            </span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            event.status === 'published' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </span>
                          <span>Visibility: {event.visibility}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/events/${event.id}`}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                          >
                            View Details
                          </Link>
                          {filter === 'upcoming' && (
                            <button className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors">
                              Register
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500 text-lg">
                    {filter === 'upcoming' 
                      ? 'No upcoming events scheduled.' 
                      : 'No past events found.'
                    }
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Check back later for updates.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}