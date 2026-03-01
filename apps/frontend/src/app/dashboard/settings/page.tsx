'use client';
import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, getApiUrl, getAuthHeaders, getMediaUrl } from '@/app/lib/api';
import { useUnsavedChanges } from '@/app/hooks/useUnsavedChanges';
import UnsavedChangesPrompt from '@/app/components/UnsavedChangesPrompt';

const UserSettings: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    location: 'Nairobi, Kenya',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    preferences: {
      propertyTypes: ['Apartment', 'Bedsitter'],
      priceRange: '50000-150000',
      location: 'Nairobi',
    },
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'preferences' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const initialProfileRef = useRef<{ firstName: string; lastName: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setProfileLoading(true);
      const res = await apiFetch<{ first_name?: string; last_name?: string; email?: string; phone?: string; avatar?: string | null }>('auth/profile/');
      if (res.ok && res.data) {
        const d = res.data;
        const profile = {
          firstName: d.first_name ?? '',
          lastName: d.last_name ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
        };
        initialProfileRef.current = profile;
        setFormData((prev) => ({
          ...prev,
          ...profile,
          fullName: [d.first_name, d.last_name].filter(Boolean).join(' ') || prev.fullName,
        }));
        if (d.avatar) setAvatarUrl(getMediaUrl(d.avatar) || d.avatar);
      }
      setProfileLoading(false);
    };
    load();
  }, []);

  const profileDirty =
    initialProfileRef.current != null &&
    (formData.firstName !== initialProfileRef.current.firstName ||
      formData.lastName !== initialProfileRef.current.lastName ||
      formData.email !== initialProfileRef.current.email ||
      formData.phone !== initialProfileRef.current.phone ||
      !!avatarFile);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications]
      }
    }));
  };

  const handlePropertyTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        propertyTypes: prev.preferences.propertyTypes.includes(type)
          ? prev.preferences.propertyTypes.filter((t) => t !== type)
          : [...prev.preferences.propertyTypes, type],
      },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      let res: { ok: boolean; error?: string; data?: { avatar?: string } };
      if (avatarFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('first_name', formData.firstName);
        formDataToSend.append('last_name', formData.lastName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('avatar', avatarFile);
        const headers = getAuthHeaders();
        delete (headers as Record<string, unknown>)['Content-Type'];
        const r = await fetch(getApiUrl('auth/profile/'), {
          method: 'PATCH',
          headers,
          body: formDataToSend,
        });
        const data = await r.json().catch(() => ({}));
        res = { ok: r.ok, error: (data as { error?: { message?: string } }).error?.message, data };
        if (res.ok && (data as { avatar?: string }).avatar) {
          setAvatarUrl(getMediaUrl((data as { avatar: string }).avatar) || (data as { avatar: string }).avatar);
          setAvatarFile(null);
          setAvatarPreview(null);
        }
      } else {
        res = await apiFetch('auth/profile/', {
          method: 'PATCH',
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          }),
        });
      }
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile saved successfully.' });
        if (initialProfileRef.current) {
          initialProfileRef.current = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          };
        }
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save profile.' });
        throw new Error('Save failed');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const profileUnsaved = useUnsavedChanges(activeSection === 'profile' && profileDirty, { onSave: handleSaveProfile });

  const handleSave = async () => {
    if (activeSection === 'profile') {
      await handleSaveProfile();
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setMessage({ type: 'success', text: 'Settings saved successfully!' });
  };

  return (
      <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  activeSection === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={async () => {
                  if (activeSection === 'profile' && profileDirty) {
                    const ok = await profileUnsaved.confirmLeave();
                    if (ok) setActiveSection('notifications');
                  } else {
                    setActiveSection('notifications');
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  activeSection === 'notifications'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={async () => {
                  if (activeSection === 'profile' && profileDirty) {
                    const ok = await profileUnsaved.confirmLeave();
                    if (ok) setActiveSection('preferences');
                  } else {
                    setActiveSection('preferences');
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  activeSection === 'preferences'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={async () => {
                  if (activeSection === 'profile' && profileDirty) {
                    const ok = await profileUnsaved.confirmLeave();
                    if (ok) setActiveSection('security');
                  } else {
                    setActiveSection('security');
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  activeSection === 'security'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Profile Information */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {profileLoading ? (
                  <p className="text-gray-500">Loading profile...</p>
                ) : (
                  <>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-500">
                            {(formData.firstName?.[0] || formData.lastName?.[0] || '?').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 w-full text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {avatarUrl || avatarPreview ? 'Change photo' : 'Upload photo'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  </>
                )}
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('email')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via SMS</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('sms')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive push notifications</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('push')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.notifications.push ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Search Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Property Types
                    </label>
                    <div className="space-y-2">
                      {['Bedsitter', 'Singles', 'Apartment', 'Condo'].map((type) => (
                        <label key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={formData.preferences.propertyTypes.includes(type)}
                            onChange={() => handlePropertyTypeChange(type)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-900">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="0-50000">Under Ksh 50,000</option>
                      <option value="50000-150000">Ksh 50,000 - 150,000</option>
                      <option value="150000-300000">Ksh 150,000 - 300,000</option>
                      <option value="300000+">Above Ksh 300,000</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesPrompt
        open={profileUnsaved.showPrompt}
        onSave={profileUnsaved.promptHandlers.onSave}
        onDiscard={profileUnsaved.promptHandlers.onDiscard}
        onCancel={profileUnsaved.promptHandlers.onCancel}
        saving={profileUnsaved.promptHandlers.saving}
        title="Unsaved profile changes"
        message="You have unsaved changes. Save before leaving?"
      />
    </div>
  );
};

export default UserSettings;
