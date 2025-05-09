'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { UserDataStatistics } from '@/components/user/UserDataStatistics';
import { DataExport } from '@/components/user/DataExport';
import { Database } from 'lucide-react';

interface UserDataManagementProps {
  className?: string;
}

export function UserDataManagement({ className = '' }: UserDataManagementProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <Database className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Data Management</h2>
      </div>
      
      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="statistics" className="flex-1">Storage Statistics</TabsTrigger>
          <TabsTrigger value="export" className="flex-1">Data Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="statistics">
          <UserDataStatistics />
        </TabsContent>
        
        <TabsContent value="export">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  );
} 