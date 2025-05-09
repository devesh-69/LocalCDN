'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AvatarUpload } from './AvatarUpload';
import { Edit, Save, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UserProfile() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    image: '',
  });

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfileData({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          image: data.image || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile information. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Cancel edits and reset form
  const handleCancel = () => {
    // Refetch the data to reset the form
    if (session?.user) {
      fetch('/api/user/profile')
        .then(response => {
          if (response.ok) return response.json();
          throw new Error('Failed to fetch profile');
        })
        .then(data => {
          setProfileData({
            name: data.name || '',
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            image: data.image || '',
          });
          setIsEditing(false);
        })
        .catch(err => {
          console.error('Error resetting profile:', err);
          toast.error('Failed to reset profile information');
        });
    }
  };

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Update session if name changed
      if (session?.user?.name !== profileData.name) {
        await update({ name: profileData.name });
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar update
  const handleAvatarUpdate = (imageUrl: string) => {
    setProfileData(prev => ({
      ...prev,
      image: imageUrl,
    }));
    
    // Update session to reflect new avatar
    if (session?.user) {
      update({ image: imageUrl });
    }
  };

  if (loading && !profileData.name) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Profile Information
        </h2>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={toggleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar section */}
        <div className="flex-shrink-0">
          <AvatarUpload 
            currentImageUrl={profileData.image}
            onAvatarUpdate={handleAvatarUpdate}
            editable={isEditing}
          />
        </div>

        {/* Profile details */}
        <div className="flex-grow">
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Display Name
              </label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="max-w-md"
              />
            </div>

            <div>
              <label 
                htmlFor="bio" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-24 max-w-md"
                placeholder={isEditing ? "Tell us about yourself..." : ""}
              />
            </div>

            <div>
              <label 
                htmlFor="location" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleChange}
                disabled={!isEditing}
                className="max-w-md"
                placeholder={isEditing ? "City, Country" : ""}
              />
            </div>

            <div>
              <label 
                htmlFor="website" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Website
              </label>
              <Input
                id="website"
                name="website"
                type="url"
                value={profileData.website}
                onChange={handleChange}
                disabled={!isEditing}
                className="max-w-md"
                placeholder={isEditing ? "https://yourwebsite.com" : ""}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 