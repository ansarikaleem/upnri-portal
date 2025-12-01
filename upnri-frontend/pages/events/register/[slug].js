// pages/events/register/[slug].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiService } from '../../../utils/api';

export default function PublicEventRegistration() {
  const router = useRouter();
  const { slug } = router.query;
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');
      // Use the correct API method - getEventBySlug
      const response = await apiService.getEventBySlug(slug);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Event not found or registration is not available');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Use the correct API method for public registration
      await apiService.registerForEventPublic(event.id, { formData });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting registration:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit registration';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Event Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || 'The event you are looking for does not exist or registration is not available.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-4">Thank you for registering for <strong>{event.title}</strong></p>
          <div className="text-sm text-gray-500 space-y-1 mb-6">
            <div>📅 {new Date(event.eventDate).toLocaleString()}</div>
            {event.venue && <div>📍 {event.venue}</div>}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Parse registration fields if they're stored as string
  const registrationFields = typeof event.registrationFields === 'string' 
    ? JSON.parse(event.registrationFields || '[]')
    : event.registrationFields || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Event Header */}
          <div className="bg-primary-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <p className="text-primary-100 text-sm mb-4">{event.description}</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                <span>{new Date(event.eventDate).toLocaleString()}</span>
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
                  <span>Max participants: {event.maxParticipants}</span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Registration Form</h2>
            
            {registrationFields.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">📝</div>
                <p className="text-gray-500">No registration form configured for this event.</p>
                <p className="text-gray-400 text-sm mt-1">Please contact the event organizer.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {registrationFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' ? (
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        placeholder={field.placeholder}
                        rows="4"
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select an option</option>
                        {field.options && field.options.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          required={field.required}
                          onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{field.placeholder || 'I agree'}</span>
                      </label>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {registrationFields.length > 0 && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
              >
                {submitting ? 'Submitting...' : 'Register for Event'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}