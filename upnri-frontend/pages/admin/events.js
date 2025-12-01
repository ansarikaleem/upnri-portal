import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';

// Registration Form Builder Component
const EventRegistrationBuilder = ({ fields, onChange }) => {
  const [activeField, setActiveField] = useState(null);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'tel', label: 'Phone', icon: '📱' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' }
  ];

  const addField = (fieldType) => {
    const newField = {
      id: Date.now().toString(),
      type: fieldType,
      label: '',
      required: false,
      placeholder: '',
      options: fieldType === 'select' ? [''] : []
    };
    onChange([...fields, newField]);
  };

  const updateField = (id, updates) => {
    const updatedFields = fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    );
    onChange(updatedFields);
  };

  const removeField = (id) => {
    onChange(fields.filter(field => field.id !== id));
  };

  const moveField = (fromIndex, toIndex) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    onChange(newFields);
  };

  return (
    <div className="space-y-6">
      {/* Available Fields */}
      <div>
        <h3 className="text-lg font-medium mb-4">Available Fields</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fieldTypes.map(fieldType => (
            <button
              key={fieldType.type}
              onClick={() => addField(fieldType.type)}
              className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition-colors"
              type="button"
            >
              <div className="text-2xl mb-1">{fieldType.icon}</div>
              <div className="text-sm text-gray-700">{fieldType.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Preview */}
      <div>
        <h3 className="text-lg font-medium mb-4">Registration Form Preview</h3>
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 min-h-[200px]">
          {fields.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Drag and drop fields from above to build your form
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`p-4 bg-white border rounded-lg cursor-move ${
                    activeField === field.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300'
                  }`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', index);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    moveField(fromIndex, index);
                  }}
                  onClick={() => setActiveField(field.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-gray-500 capitalize">{field.type} Field</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />

                    {field.type !== 'checkbox' && (
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    )}

                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Options</label>
                        {field.options.map((option, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...field.options];
                              newOptions[optionIndex] = e.target.value;
                              updateField(field.id, { options: newOptions });
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm mb-1"
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => updateField(field.id, { options: [...field.options, ''] })}
                          className="text-primary-600 text-sm hover:text-primary-700"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Required field</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    venue: '',
    maxParticipants: '',
    status: 'draft',
    visibility: 'public',
    featuredImage: ''
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Registration form states - now inline, not in popup
  const [showRegistrationBuilder, setShowRegistrationBuilder] = useState(false);
  const [registrationFields, setRegistrationFields] = useState([]);
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [registrationSlug, setRegistrationSlug] = useState('');
  
  // Registrations view states
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [currentEventRegistrations, setCurrentEventRegistrations] = useState({
    memberRegistrations: [],
    publicRegistrations: []
  });
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  // Fix hydration by setting client state
  useEffect(() => {
    setIsClient(true);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvents({ limit: 50 });
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        venue: formData.venue.trim(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        status: formData.status,
        visibility: formData.visibility,
        featuredImage: formData.featuredImage.trim()
      };

      if (editingEvent) {
        await apiService.updateEvent(editingEvent.id, eventData);
      } else {
        await apiService.createEvent(eventData);
      }
      
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
      venue: event.venue || '',
      maxParticipants: event.maxParticipants || '',
      status: event.status || 'draft',
      visibility: event.visibility || 'public',
      featuredImage: event.featuredImage || ''
    });
    // Reset registration builder when editing event
    setShowRegistrationBuilder(false);
    setRegistrationFields([]);
    setRegistrationEnabled(false);
    setRegistrationSlug('');
  };

  const handleDeleteEvent = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await apiService.deleteEvent(id);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  // Registration Form Functions
  const handleOpenRegistrationBuilder = (event) => {
    setEditingEvent(event);
    // Ensure registrationFields is always an array
    const fields = event.registrationFields || [];
    setRegistrationFields(Array.isArray(fields) ? fields : []);
    setRegistrationEnabled(event.registrationFormEnabled || false);
    setRegistrationSlug(event.registrationSlug || '');
    setShowRegistrationBuilder(true);
  };

  const handleSaveRegistrationForm = async () => {
    try {
      await apiService.updateEventRegistrationForm(editingEvent.id, {
        registrationFields,
        registrationFormEnabled: registrationEnabled,
        registrationSlug
      });
      setShowRegistrationBuilder(false);
      fetchEvents();
      alert('Registration form saved successfully!');
    } catch (error) {
      console.error('Error saving registration form:', error);
      alert('Failed to save registration form');
    }
  };

  const handleCancelRegistrationForm = () => {
    setShowRegistrationBuilder(false);
    setRegistrationFields([]);
    setRegistrationEnabled(false);
    setRegistrationSlug('');
  };

  // Registrations View Functions
  const handleViewRegistrations = async (event) => {
    try {
      setRegistrationsLoading(true);
      setEditingEvent(event);
      const response = await apiService.getEventRegistrations(event.id);
      setCurrentEventRegistrations(response.data);
      setShowRegistrations(true);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to load registrations');
    } finally {
      setRegistrationsLoading(false);
    }
  };

  // Helper functions for registrations view
  const getPublicRegistrationHeaders = () => {
    if (!currentEventRegistrations?.publicRegistrations?.length) return [];
    
    // Get all unique field labels from the first registration's form data
    const firstRegistration = currentEventRegistrations.publicRegistrations[0];
    if (!firstRegistration?.formData) return [];
    
    try {
      const formFields = typeof firstRegistration.formData === 'string' 
        ? JSON.parse(firstRegistration.formData)
        : firstRegistration.formData;
      
      // Ensure formFields is an array
      if (!Array.isArray(formFields)) return [];
      
      return formFields.map(field => field.label || field.id);
    } catch (error) {
      console.error('Error parsing form fields:', error);
      return [];
    }
  };

  const getFieldValue = (registration, fieldIndex) => {
    if (!registration.registrantData) return '-';
    
    try {
      const formFields = typeof registration.formData === 'string' 
        ? JSON.parse(registration.formData)
        : registration.formData;
      
      // Ensure formFields is an array
      if (!Array.isArray(formFields) || !formFields[fieldIndex]) return '-';
      
      const fieldId = formFields[fieldIndex].id;
      const value = registration.registrantData[fieldId];
      
      if (value === null || value === undefined) return '-';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'object') return JSON.stringify(value);
      
      return String(value);
    } catch (error) {
      console.error('Error getting field value:', error);
      return '-';
    }
  };

  const exportToCSV = () => {
    if (!currentEventRegistrations) return;
    
    const csvData = [];
    const headers = ['Type', 'Name', 'Email', 'Phone', 'Status', 'Registered At'];
    
    // Add custom headers from public registrations
    const publicHeaders = getPublicRegistrationHeaders();
    headers.push(...publicHeaders);
    
    csvData.push(headers);
    
    // Add member registrations
    currentEventRegistrations.memberRegistrations?.forEach(reg => {
      const row = [
        'Member',
        reg.member?.fullName || '',
        reg.member?.email || '',
        reg.member?.phone || '',
        reg.status || '',
        reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : ''
      ];
      
      // Add empty values for public registration columns
      publicHeaders.forEach(() => row.push(''));
      
      csvData.push(row);
    });
    
    // Add public registrations
    currentEventRegistrations.publicRegistrations?.forEach((reg, index) => {
      const row = [
        'Public',
        '', // Name
        '', // Email
        '', // Phone
        '', // Status
        reg.createdAt ? new Date(reg.createdAt).toLocaleString() : ''
      ];
      
      // Add values for public registration fields
      publicHeaders.forEach((header, fieldIndex) => {
        row.push(getFieldValue(reg, fieldIndex));
      });
      
      csvData.push(row);
    });
    
    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations-${editingEvent?.title}-${new Date().toISOString().split('T')[0]}.csv`.replace(/[^a-z0-9]/gi, '-'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      venue: '',
      maxParticipants: '',
      status: 'draft',
      visibility: 'public',
      featuredImage: ''
    });
    setEditingEvent(null);
    setShowRegistrationBuilder(false);
    setRegistrationFields([]);
    setRegistrationEnabled(false);
    setRegistrationSlug('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const RegistrationBadge = ({ event }) => {
    if (!event.registrationFormEnabled) {
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">No Form</span>;
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
        Form Active
      </span>
    );
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <PrivateRoute adminOnly>
      <AdminLayout>
        <Head>
          <title>Manage Events - Admin Panel</title>
        </Head>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
              <p className="text-gray-600">Create and manage community events</p>
            </div>
          </div>

          {/* Event Form - Above the events grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Event title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Event description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Event location..."
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      min="1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visibility
                      </label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="public">Public</option>
                        <option value="members">Members Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      name="featuredImage"
                      value={formData.featuredImage}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>

          {/* Registration Form Builder - Now inline below the main form */}
          {showRegistrationBuilder && editingEvent && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Registration Form Builder - {editingEvent.title}
                  </h2>
                  <button
                    onClick={handleCancelRegistrationForm}
                    className="text-gray-500 hover:text-gray-700"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Link Slug *
                  </label>
                  <input
                    type="text"
                    value={registrationSlug}
                    onChange={(e) => setRegistrationSlug(e.target.value)}
                    placeholder="my-event-registration"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                  <p className="text-sm text-gray-600">
                    Public URL: {isClient && `${window.location.origin}/events/register/${registrationSlug}`}
                  </p>
                </div>

                <EventRegistrationBuilder
                  fields={registrationFields}
                  onChange={setRegistrationFields}
                />

                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={registrationEnabled}
                      onChange={(e) => setRegistrationEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Enable public registration</span>
                  </label>

                  <div className="space-x-3">
                    <button
                      onClick={handleCancelRegistrationForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRegistrationForm}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      type="button"
                    >
                      Save Registration Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Events</h2>
            </div>

            {loading ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {event.featuredImage && (
                        <img
                          src={event.featuredImage}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span>{event.eventDate ? new Date(event.eventDate).toLocaleString() : 'Date not set'}</span>
                          </div>
                          {event.venue && (
                            <div className="flex items-center">
                              <span className="mr-2">📍</span>
                              <span className="line-clamp-1">{event.venue}</span>
                            </div>
                          )}
                          {event.maxParticipants && (
                            <div className="flex items-center">
                              <span className="mr-2">👥</span>
                              <span>Max: {event.maxParticipants}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <StatusBadge status={event.status} />
                          <RegistrationBadge event={event} />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="bg-primary-600 text-white py-2 px-3 rounded-md text-sm hover:bg-primary-700 transition-colors"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleOpenRegistrationBuilder(event)}
                            className="bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors"
                            type="button"
                          >
                            Form
                          </button>
                          <button
                            onClick={() => handleViewRegistrations(event)}
                            className="bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                            type="button"
                          >
                            View Reg
                          </button>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="w-full bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>

                        {event.registrationFormEnabled && event.registrationSlug && (
                          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-800 mb-1">Public Registration Link:</p>
                            <code className="text-xs bg-white p-1 rounded border break-all">
                              {isClient && `${window.location.origin}/events/register/${event.registrationSlug}`}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {events.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-3">📅</div>
                    <p className="text-gray-500 text-lg">No events found.</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first event using the form above.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Registrations View Modal */}
          {showRegistrations && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Registrations for {editingEvent?.title}</h2>
                      <p className="text-gray-600 text-sm">
                        Total: {(currentEventRegistrations?.memberRegistrations?.length || 0) + (currentEventRegistrations?.publicRegistrations?.length || 0)} registrations
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        type="button"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => setShowRegistrations(false)}
                        className="text-gray-500 hover:text-gray-700"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {registrationsLoading ? (
                    <div className="text-center py-8">Loading registrations...</div>
                  ) : (
                    <div className="space-y-8">
                      {/* Member Registrations */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                            {currentEventRegistrations?.memberRegistrations?.length || 0}
                          </span>
                          Member Registrations
                        </h3>
                        {currentEventRegistrations?.memberRegistrations?.length > 0 ? (
                          <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registered At
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {currentEventRegistrations.memberRegistrations.map(reg => (
                                  <tr key={reg.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {reg.member?.fullName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {reg.member?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {reg.member?.phone || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        reg.status === 'registered' ? 'bg-green-100 text-green-800' :
                                        reg.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {reg.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-gray-400 text-4xl mb-3">👥</div>
                            <p className="text-gray-500">No member registrations</p>
                          </div>
                        )}
                      </div>

                      {/* Public Registrations */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2">
                            {currentEventRegistrations?.publicRegistrations?.length || 0}
                          </span>
                          Public Registrations
                        </h3>
                        {currentEventRegistrations?.publicRegistrations?.length > 0 ? (
                          <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #
                                  </th>
                                  {getPublicRegistrationHeaders().map((header, index) => (
                                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      {header}
                                    </th>
                                  ))}
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registered At
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {currentEventRegistrations.publicRegistrations.map((reg, index) => (
                                  <tr key={reg.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {index + 1}
                                    </td>
                                    {getPublicRegistrationHeaders().map((header, fieldIndex) => (
                                      <td key={fieldIndex} className="px-6 py-4 text-sm text-gray-900">
                                        {getFieldValue(reg, fieldIndex)}
                                      </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {reg.createdAt ? new Date(reg.createdAt).toLocaleString() : 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-gray-400 text-4xl mb-3">🌐</div>
                            <p className="text-gray-500">No public registrations</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </PrivateRoute>
  );
}