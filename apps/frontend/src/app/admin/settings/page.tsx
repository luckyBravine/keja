'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { apiFetch, getApiUrl, getAuthHeaders, getMediaUrl } from '@/app/lib/api';
import { useUnsavedChanges } from '@/app/hooks/useUnsavedChanges';
import UnsavedChangesPrompt from '@/app/components/UnsavedChangesPrompt';

const MapWithDirections = dynamic(
  () => import('@/app/components/MapWithDirections'),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-gray-200 bg-gray-100 h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  bio: string;
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapData, setMapData] = useState({ origin: '', destination: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const initialProfileRef = useRef<ProfileData | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await apiFetch<{
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        avatar?: string | null;
      }>('auth/profile/');
      if (res.ok && res.data) {
        const d = res.data;
        const data = {
          firstName: d.first_name ?? '',
          lastName: d.last_name ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          company: '',
          bio: '',
        };
        initialProfileRef.current = data;
        setProfileData(data);
        if (d.avatar) setAvatarUrl(getMediaUrl(d.avatar) || d.avatar);
      }
      setLoading(false);
    };
    load();
  }, []);

  const profileDirty =
    initialProfileRef.current != null &&
    (profileData.firstName !== initialProfileRef.current.firstName ||
      profileData.lastName !== initialProfileRef.current.lastName ||
      profileData.email !== initialProfileRef.current.email ||
      profileData.phone !== initialProfileRef.current.phone ||
      !!avatarFile);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (avatarFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('first_name', profileData.firstName);
        formDataToSend.append('last_name', profileData.lastName);
        formDataToSend.append('email', profileData.email);
        formDataToSend.append('phone', profileData.phone);
        formDataToSend.append('avatar', avatarFile);
        const headers = getAuthHeaders();
        delete (headers as Record<string, unknown>)['Content-Type'];
        const r = await fetch(getApiUrl('auth/profile/'), {
          method: 'PATCH',
          headers,
          body: formDataToSend,
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok) {
          setMessage({ type: 'success', text: 'Profile updated successfully.' });
          if ((data as { avatar?: string }).avatar) {
            setAvatarUrl(getMediaUrl((data as { avatar: string }).avatar) || (data as { avatar: string }).avatar);
            setAvatarFile(null);
            setAvatarPreview(null);
          }
          if (initialProfileRef.current) {
            initialProfileRef.current = { ...profileData, company: '', bio: '' };
          }
        } else {
          setMessage({ type: 'error', text: (data as { error?: { message?: string } }).error?.message || 'Failed to update profile.' });
          throw new Error('Save failed');
        }
      } else {
        const res = await apiFetch('auth/profile/', {
          method: 'PATCH',
          body: JSON.stringify({
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
          }),
        });
        if (res.ok) {
          setMessage({ type: 'success', text: 'Profile updated successfully.' });
          if (initialProfileRef.current) {
            initialProfileRef.current = { ...profileData, company: '', bio: '' };
          }
        } else {
          setMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
          throw new Error('Save failed');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const profileUnsaved = useUnsavedChanges(activeTab === 'profile' && profileDirty, { onSave: saveProfile });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile();
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (activeTab === 'profile') {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    } else {
      setMapData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your profile and application settings.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={async () => {
                if (activeTab === 'profile' && profileDirty) {
                  const ok = await profileUnsaved.confirmLeave();
                  if (ok) setActiveTab('map');
                } else {
                  setActiveTab('map');
                }
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Map & Directions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {loading ? (
                <p className="text-gray-500">Loading profile...</p>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-600">
                            {(profileData.firstName?.[0] || profileData.lastName?.[0] || '?').toUpperCase()}
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
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {avatarUrl || avatarPreview ? 'Change photo' : 'Upload photo'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">JPG, PNG or WebP. Max 5MB.</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={profileData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📍</span>
                <h2 className="text-xl font-semibold text-gray-900">Property Map & Directions</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Enter your location and a property or address to see a map and driving route.
              </p>
              <MapWithDirections
                origin={mapData.origin}
                destination={mapData.destination}
                onOriginChange={(value) => setMapData((prev) => ({ ...prev, origin: value }))}
                onDestinationChange={(value) => setMapData((prev) => ({ ...prev, destination: value }))}
                onGetDirections={() => setMessage({ type: 'success', text: 'Directions loaded on map.' })}
                height="420px"
                showForm={true}
              />
            </div>
          )}
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

export default AdminSettings;
