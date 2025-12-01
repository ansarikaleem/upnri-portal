import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

export default function EventDetail() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Mock data - replace with actual API call
  const event = {
    id: 1,
    title: 'UPNRI Forum Annual Meet 2024',
    description: 'Join us for our annual community gathering where we celebrate our culture, network with fellow community members, and plan for the future.',
    eventDate: '2024-02-15T18:00:00Z',
    venue: 'Grand Ballroom, Kuwait City',
    maxParticipants: 200,
    registrationCount: 150,
    featuredImage: '/images/event1.jpg',
    status: 'published',
    visibility: 'public',
    registrationForm: {
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'guests', label: 'Number of Guests', type: 'number', required: false },
        { name: 'dietary', label: 'Dietary Restrictions', type: 'textarea', required: false }
      ]
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsRegistered(true);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (router.isFallback) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const availableSpots = event.maxParticipants - event.registrationCount;

  return (
    <Layout>
      <Head>
        <title>{event.title} - UPNRI Forum Kuwait</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Event Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {event.featuredImage && (
                <img 
                  src={event.featuredImage} 
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-3 text-xl">📅</span>
                    <div>
                      <div className="font-medium">Date & Time</div>
                      <div>{new Date(event.eventDate).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-3 text-xl">📍</span>
                    <div>
                      <div className="font-medium">Venue</div>
                      <div>{event.venue}</div>
                    </div>
                  </div>
                </div>

                {event.maxParticipants && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900">Registration Status</div>
                        <div className="text-blue-700">
                          {event.registrationCount} of {event.maxParticipants} registered
                          {availableSpots > 0 && ` (${availableSpots} spots available)`}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        availableSpots > 10 
                          ? 'bg-green-100 text-green-800'
                          : availableSpots > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {availableSpots > 0 ? 'Spots Available' : 'Fully Booked'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Description */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">About This Event</h2>
                  <div className="prose text-gray-700">
                    <p>{event.description}</p>
                    
                    <h3 className="text-lg font-semibold mt-6 mb-3">Event Highlights</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Cultural performances from different regions of Uttar Pradesh</li>
                      <li>Traditional cuisine and delicacies</li>
                      <li>Networking opportunities with community members</li>
                      <li>Recognition ceremony for community contributors</li>
                      <li>Business networking session</li>
                      <li>Family-friendly activities</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-6 mb-3">Additional Information</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Dress code: Traditional Indian attire preferred</li>
                      <li>Free parking available at venue</li>
                      <li>Family and friends are welcome</li>
                      <li>Registration required for all attendees</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                  {isRegistered ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✅</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                      <p className="text-gray-600 mb-4">
                        Thank you for registering for this event. We look forward to seeing you there!
                      </p>
                      <button
                        onClick={() => setIsRegistered(false)}
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
                      >
                        Register Another Person
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-4 text-gray-800">Register for Event</h3>
                      
                      {availableSpots <= 0 ? (
                        <div className="text-center py-4">
                          <p className="text-red-600 font-medium">This event is fully booked.</p>
                          <p className="text-gray-600 text-sm mt-2">
                            Please check back later for cancellations or future events.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              {...register('fullName', { required: 'Full name is required' })}
                              className="input-field"
                            />
                            {errors.fullName && (
                              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              {...register('phone', { required: 'Phone number is required' })}
                              className="input-field"
                            />
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              {...register('email', { required: 'Email is required' })}
                              className="input-field"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Number of Guests
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              {...register('guests')}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dietary Restrictions
                            </label>
                            <textarea
                              {...register('dietary')}
                              rows="3"
                              className="input-field"
                              placeholder="Any dietary requirements or allergies..."
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Registering...' : 'Register Now'}
                          </button>

                          <p className="text-xs text-gray-500 text-center">
                            By registering, you agree to our terms and conditions.
                          </p>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}