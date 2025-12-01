import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiService.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <PrivateRoute adminOnly>
        <AdminLayout>
          <div className="p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </AdminLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute adminOnly>
      <AdminLayout>
        <Head>
          <title>Website Settings - Admin Panel</title>
        </Head>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
            <p className="text-gray-600">Configure website settings and preferences</p>
          </div>

          <form onSubmit={handleSave}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* General Settings */}
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Title
                      </label>
                      <input
                        type="text"
                        value={settings.website_title || ''}
                        onChange={(e) => handleChange('website_title', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Description
                      </label>
                      <textarea
                        value={settings.website_description || ''}
                        onChange={(e) => handleChange('website_description', e.target.value)}
                        rows="3"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.contact_email || ''}
                        onChange={(e) => handleChange('contact_email', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Theme Settings</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme Mode
                      </label>
                      <select
                        value={settings.theme?.mode || 'light'}
                        onChange={(e) => handleChange('theme', {
                          ...settings.theme,
                          mode: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.theme?.primary_color || '#3b82f6'}
                          onChange={(e) => handleChange('theme', {
                            ...settings.theme,
                            primary_color: e.target.value
                          })}
                          className="w-12 h-12 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={settings.theme?.primary_color || '#3b82f6'}
                          onChange={(e) => handleChange('theme', {
                            ...settings.theme,
                            primary_color: e.target.value
                          })}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </AdminLayout>
    </PrivateRoute>
  );
}