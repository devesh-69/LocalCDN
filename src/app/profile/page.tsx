'use client';

import React, { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { UserProfile } from '@/components/user/UserProfile';
import { UserPreferences } from '@/components/user/UserPreferences';
import { UserStats } from '@/components/user/UserStats';
import { AccountSettings } from '@/components/user/AccountSettings';
import { PrivacySettings } from '@/components/user/PrivacySettings';
import { UserDataManagement } from '@/components/user/UserDataManagement';
import { Database } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <ProtectedRoute>
      <Container>
        <div className="py-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
              User Profile
            </h1>
            
            <Tabs 
              defaultValue="profile" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b border-gray-200 dark:border-gray-700">
                <TabsList className="flex">
                  <TabsTrigger 
                    value="profile"
                    className="px-6 py-3 text-sm font-medium"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences"
                    className="px-6 py-3 text-sm font-medium"
                  >
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger 
                    value="privacy"
                    className="px-6 py-3 text-sm font-medium"
                  >
                    Privacy
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account"
                    className="px-6 py-3 text-sm font-medium"
                  >
                    Account Settings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="data"
                    className="px-6 py-3 text-sm font-medium flex items-center"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Data Management
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="profile" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <UserProfile />
                  </div>
                  <div className="md:col-span-1">
                    <UserStats />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-0">
                <UserPreferences />
              </TabsContent>
              
              <TabsContent value="privacy" className="mt-0">
                <PrivacySettings />
              </TabsContent>
              
              <TabsContent value="account" className="mt-0">
                <AccountSettings />
              </TabsContent>
              
              <TabsContent value="data" className="mt-0">
                <UserDataManagement />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  );
} 