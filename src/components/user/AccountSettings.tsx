'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { 
  AlertTriangle, 
  Lock, 
  Shield, 
  LogOut, 
  Mail, 
  Key, 
  Save, 
  Eye, 
  EyeOff,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

interface AccountSettingsProps {
  className?: string;
}

export function AccountSettings({ className = '' }: AccountSettingsProps) {
  const { data: session, update: updateSession } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Optional security settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (passwordError) {
      setPasswordError(null);
    }
    
    // Clear success message when user types
    if (showSuccess) {
      setShowSuccess(false);
    }
  };

  // Validate password fields
  const validatePasswords = () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return false;
    }
    
    return true;
  };

  // Handle password change form submission
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!validatePasswords()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      // Clear form and show success message
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setShowSuccess(true);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logging out from all devices
  const handleLogoutAllDevices = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/user/sessions', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to logout from other devices');
      }
      
      toast.success('Logged out from all other devices');
      
      // Update session to refresh token
      await updateSession();
    } catch (error) {
      console.error('Error logging out from devices:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to logout from other devices');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle session timeout change
  const handleSessionTimeoutChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeout = e.target.value;
    setSessionTimeout(newTimeout);
    
    try {
      // TODO: In a full implementation, this would save the timeout preference to the user's account
      // For now, we'll just show a success message
      toast.success(`Session timeout updated to ${newTimeout} minutes`);
    } catch (error) {
      console.error('Error updating session timeout:', error);
      toast.error('Failed to update session timeout');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex items-center space-x-2">
        <Lock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Account Settings</h2>
      </div>
      
      {/* Password Change Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Change Password</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 text-red-700 dark:text-red-300">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>{passwordError}</p>
              </div>
            </div>
          )}
          
          {showSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 text-green-700 dark:text-green-300">
              <div className="flex">
                <Check className="h-5 w-5 mr-2" />
                <p>Password successfully changed!</p>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                className="pr-10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'} 
                value={passwordData.newPassword}
                onChange={handleInputChange}
                className="pr-10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Must be at least 8 characters long
            </p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center mt-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </form>
      </div>
      
      {/* Session Management Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Session Management</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="sessionTimeout">Session Timeout</Label>
            <select 
              id="sessionTimeout"
              value={sessionTimeout}
              onChange={handleSessionTimeoutChange}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="720">12 hours</option>
              <option value="1440">24 hours</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your session will automatically expire after this time of inactivity
            </p>
          </div>
          
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogoutAllDevices}
              disabled={isSubmitting}
              className="flex items-center"
            >
              <Shield className="mr-2 h-4 w-4" />
              Logout from All Other Devices
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will terminate all other active sessions across all devices
            </p>
          </div>
        </div>
      </div>
      
      {/* Email Notifications Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Notifications</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications" className="font-medium">Security Email Notifications</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Receive email alerts for important account activities
            </p>
          </div>
          <Switch 
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
      </div>
      
      {/* Account Actions Section */}
      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium">Account Actions</h3>
        
        <div className="space-y-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 