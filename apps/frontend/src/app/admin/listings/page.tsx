'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl, getMediaUrl } from '@/app/lib/api';
import { useUnsavedChanges } from '@/app/hooks/useUnsavedChanges';
import UnsavedChangesPrompt from '@/app/components/UnsavedChangesPrompt';

interface Listing {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price: string;
  status: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  created_at: string;
  primary_image?: string | null;
  images?: Array<{ id: number; image: string; is_primary: boolean }>;
}

const INITIAL_ADD_FORM = {
  title: '',
  description: '',
  property_type: 'bedsitter' as const,
  address: '',
  city: '',
  state: '',
  zip_code: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  square_feet: '',
  lot_size: '',
  year_built: '',
  parking_spaces: '0',
  has_garage: false,
  has_pool: false,
  has_garden: false,
  status: 'active' as const,
};

const AdminListings: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState(INITIAL_ADD_FORM);

  const getToken = () => localStorage.getItem('access_token') || localStorage.getItem('accessToken');

  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  type FormDataShape = Omit<typeof INITIAL_ADD_FORM, 'property_type' | 'status'> & { property_type: string; status: string };
  const [editFormData, setEditFormData] = useState<FormDataShape | null>(null);
  const initialEditFormRef = useRef<FormDataShape | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const addFormDirty =
    formData.title !== '' ||
    formData.description !== '' ||
    formData.address !== '' ||
    formData.city !== '' ||
    formData.state !== '' ||
    formData.zip_code !== '' ||
    formData.price !== '' ||
    formData.bedrooms !== '' ||
    formData.bathrooms !== '' ||
    formData.square_feet !== '' ||
    formData.lot_size !== '' ||
    formData.year_built !== '' ||
    formData.parking_spaces !== '0' ||
    formData.property_type !== 'bedsitter' ||
    formData.status !== 'active' ||
    formData.has_garage ||
    formData.has_pool ||
    formData.has_garden ||
    selectedImages.length > 0;

  const editFormDirty = (() => {
    if (!editFormData || !initialEditFormRef.current) return false;
    const a = editFormData;
    const b = initialEditFormRef.current;
    return (
      a.title !== b.title ||
      a.description !== b.description ||
      a.address !== b.address ||
      a.city !== b.city ||
      a.state !== b.state ||
      a.zip_code !== b.zip_code ||
      a.price !== b.price ||
      a.bedrooms !== b.bedrooms ||
      a.bathrooms !== b.bathrooms ||
      a.square_feet !== b.square_feet ||
      a.status !== b.status ||
      a.has_garage !== b.has_garage ||
      a.has_pool !== b.has_pool ||
      a.has_garden !== b.has_garden
    );
  })();

  useEffect(() => {
    fetchListings();
  }, []);

  const closeAddForm = useCallback(() => {
    setFormData(INITIAL_ADD_FORM);
    setSelectedImages([]);
    setImagePreviews([]);
    setShowAddForm(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const submitAddListing = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Please log in to create a listing');
      throw new Error('Not authenticated');
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const listingPayload = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        square_feet: parseInt(formData.square_feet),
        lot_size: formData.lot_size ? parseInt(formData.lot_size) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        parking_spaces: parseInt(formData.parking_spaces),
        has_garage: formData.has_garage,
        has_pool: formData.has_pool,
        has_garden: formData.has_garden,
        status: formData.status,
      };
      const response = await fetch(getApiUrl('listings/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(listingPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to create listing');
      }
      const newListing = await response.json();
      setSuccessMessage('Listing created successfully!');
      if (selectedImages.length > 0 && newListing.id) {
        await uploadImages(newListing.id, selectedImages, token);
      }
      setFormData(INITIAL_ADD_FORM);
      setSelectedImages([]);
      setImagePreviews([]);
      setShowAddForm(false);
      await fetchListings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create listing. Please try again.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedImages]);

  const submitEditListing = useCallback(async () => {
    if (!editingListing || !editFormData) return;
    const token = getToken();
    if (!token) {
      setError('Please log in to edit');
      throw new Error('Not authenticated');
    }
    setIsEditing(true);
    setError(null);
    try {
      const payload = {
        title: editFormData.title,
        description: editFormData.description || undefined,
        property_type: editFormData.property_type,
        address: editFormData.address,
        city: editFormData.city,
        state: editFormData.state,
        zip_code: editFormData.zip_code || undefined,
        price: parseFloat(editFormData.price),
        bedrooms: parseInt(editFormData.bedrooms, 10),
        bathrooms: parseFloat(editFormData.bathrooms),
        square_feet: parseInt(editFormData.square_feet, 10),
        lot_size: editFormData.lot_size ? parseInt(editFormData.lot_size, 10) : null,
        year_built: editFormData.year_built ? parseInt(editFormData.year_built, 10) : null,
        parking_spaces: parseInt(editFormData.parking_spaces, 10),
        has_garage: editFormData.has_garage,
        has_pool: editFormData.has_pool,
        has_garden: editFormData.has_garden,
        status: editFormData.status,
      };
      const res = await fetch(getApiUrl(`listings/${editingListing.id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.detail || 'Failed to update');
      }
      setSuccessMessage('Listing updated successfully');
      setEditingListing(null);
      setEditFormData(null);
      initialEditFormRef.current = null;
      await fetchListings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
      throw err;
    } finally {
      setIsEditing(false);
    }
  }, [editingListing, editFormData]);

  const addFormUnsaved = useUnsavedChanges(showAddForm && addFormDirty, { onSave: submitAddListing });
  const editFormUnsaved = useUnsavedChanges(!!(editingListing && editFormDirty), { onSave: submitEditListing });

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch(getApiUrl('listings/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data.results || data);
      } else {
        setError('Failed to load listings');
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAddListing();
  };

  const handleEditClick = async (listing: Listing) => {
    setEditingListing(listing);
    const token = getToken();
    try {
      const res = await fetch(getApiUrl(`listings/${listing.id}/`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const full = await res.json();
      const data = {
        title: full.title ?? listing.title,
        description: full.description ?? '',
        property_type: full.property_type ?? listing.property_type,
        address: full.address ?? listing.address,
        city: full.city ?? listing.city,
        state: full.state ?? listing.state,
        zip_code: full.zip_code ?? '',
        price: String(full.price ?? listing.price),
        bedrooms: String(full.bedrooms ?? listing.bedrooms),
        bathrooms: String(full.bathrooms ?? listing.bathrooms),
        square_feet: String(full.square_feet ?? listing.square_feet),
        lot_size: full.lot_size != null ? String(full.lot_size) : '',
        year_built: full.year_built != null ? String(full.year_built) : '',
        parking_spaces: full.parking_spaces != null ? String(full.parking_spaces) : '0',
        has_garage: full.has_garage ?? false,
        has_pool: full.has_pool ?? false,
        has_garden: full.has_garden ?? false,
        status: full.status ?? listing.status,
      };
      initialEditFormRef.current = { ...data };
      setEditFormData(data);
    } catch {
      const data = {
        title: listing.title,
        description: '',
        property_type: listing.property_type,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zip_code: '',
        price: String(listing.price),
        bedrooms: String(listing.bedrooms),
        bathrooms: String(listing.bathrooms),
        square_feet: String(listing.square_feet),
        lot_size: '',
        year_built: '',
        parking_spaces: '0',
        has_garage: false,
        has_pool: false,
        has_garden: false,
        status: listing.status,
      };
      initialEditFormRef.current = { ...data };
      setEditFormData(data);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editFormData) return;
    const { name, value, type } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEditListing();
  };

  const handleDeleteClick = (id: number) => setDeleteConfirm(id);
  const handleDeleteConfirm = async () => {
    if (deleteConfirm == null) return;
    setIsDeleting(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Please log in to delete');
        return;
      }
      const res = await fetch(getApiUrl(`listings/${deleteConfirm}/`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete listing');
      setSuccessMessage('Listing deleted successfully');
      setDeleteConfirm(null);
      await fetchListings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadImages = async (listingId: number, images: File[], token: string) => {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      formData.append('images', image);
      formData.append(`caption_${index}`, '');
      if (index === 0) {
        formData.append(`is_primary_${index}`, 'true');
      } else {
        formData.append(`is_primary_${index}`, 'false');
      }
    });

    try {
      const response = await fetch(getApiUrl(`listings/${listingId}/upload_images/`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.error('Failed to upload images');
      }
    } catch (err) {
      console.error('Error uploading images:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Current Listings</h1>
          <p className="mt-2 text-gray-600">Manage your property listings and track their performance.</p>
        </div>
        <button
          onClick={async () => {
            if (showAddForm) {
              const ok = await addFormUnsaved.confirmLeave();
              if (ok) closeAddForm();
            } else {
              setShowAddForm(true);
              setError(null);
              setSuccessMessage(null);
            }
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add New Listing'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Listing Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Post New Listing</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Beautiful 3BR Family Home"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="bedsitter">Bedsitter</option>
                  <option value="singles">Singles</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of the property features and amenities."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Location */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="E.g., 123 Main St"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="E.g., Nairobi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="E.g., Nairobi County"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="E.g., 00100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (KES) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="E.g., 5000000"
                    min="0"
                    step="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="E.g., 3"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="E.g., 2.5"
                    min="0"
                    max="50"
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Feet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="square_feet"
                    value={formData.square_feet}
                    onChange={handleInputChange}
                    placeholder="E.g., 2000"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lot Size (sq ft)
                  </label>
                  <input
                    type="number"
                    name="lot_size"
                    value={formData.lot_size}
                    onChange={handleInputChange}
                    placeholder="E.g., 5000"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Built
                  </label>
                  <input
                    type="number"
                    name="year_built"
                    value={formData.year_built}
                    onChange={handleInputChange}
                    placeholder="E.g., 2020"
                    min="1800"
                    max="2100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    name="parking_spaces"
                    value={formData.parking_spaces}
                    onChange={handleInputChange}
                    placeholder="E.g., 2"
                    min="0"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_garage"
                    checked={formData.has_garage}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Has Garage</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_pool"
                    checked={formData.has_pool}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Has Pool</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_garden"
                    checked={formData.has_garden}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Has Garden</span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images (Multiple files supported)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {selectedImages.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedImages.length} image(s) selected
                    </span>
                  )}
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={async () => {
                  const ok = await addFormUnsaved.confirmLeave();
                  if (ok) closeAddForm();
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </>
                ) : (
                  'Post Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingListing && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Listing</h2>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" value={editFormData.title} onChange={handleEditInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditInputChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" name="address" value={editFormData.address} onChange={handleEditInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={editFormData.city} onChange={handleEditInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" name="price" value={editFormData.price} onChange={handleEditInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={editFormData.status} onChange={handleEditInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await editFormUnsaved.confirmLeave();
                    if (ok) {
                      setEditingListing(null);
                      setEditFormData(null);
                      initialEditFormRef.current = null;
                      setError(null);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isEditing} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{isEditing ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete listing?</h2>
            <p className="text-gray-600 mb-6">This will remove the listing. You can&apos;t undo this.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <UnsavedChangesPrompt
        open={addFormUnsaved.showPrompt}
        onSave={addFormUnsaved.promptHandlers.onSave}
        onDiscard={addFormUnsaved.promptHandlers.onDiscard}
        onCancel={addFormUnsaved.promptHandlers.onCancel}
        saving={addFormUnsaved.promptHandlers.saving}
        title="Unsaved listing"
        message="You have unsaved changes. Save before leaving?"
      />
      <UnsavedChangesPrompt
        open={editFormUnsaved.showPrompt}
        onSave={editFormUnsaved.promptHandlers.onSave}
        onDiscard={editFormUnsaved.promptHandlers.onDiscard}
        onCancel={editFormUnsaved.promptHandlers.onCancel}
        saving={editFormUnsaved.promptHandlers.saving}
        title="Unsaved changes"
        message="You have unsaved changes. Save before closing?"
      />

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No listings found. Create your first listing!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROPERTY</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ADDRESS</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRICE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE POSTED</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 relative flex items-center justify-center">
                        {(() => {
                          const rawUrl = listing.primary_image ?? (listing.images?.[0]?.image);
                          const src = rawUrl ? getMediaUrl(rawUrl) : '';
                          if (!src) {
                            return <span className="text-xs text-gray-400">No Image</span>;
                          }
                          return (
                            <>
                              <img
                                src={src}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const wrap = e.currentTarget.closest('.relative');
                                  const fallback = wrap?.querySelector('.listing-img-fallback');
                                  if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                                }}
                              />
                              <div className="listing-img-fallback hidden absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-xs text-gray-400">No Image</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                      <div className="text-sm text-gray-500">{listing.address}, {listing.city}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      KES {parseFloat(listing.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        listing.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : listing.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{listing.property_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(listing)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label="Edit listing"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(listing.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Delete listing"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminListings;
