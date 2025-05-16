
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageStats } from '@/types/mongodb';
import { Eye, EyeOff, Database } from 'lucide-react';

interface StatsCardsProps {
  stats: ImageStats;
  loading: boolean;
}

const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-secondary/30 border-none shadow-none">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/20">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Images</div>
              <div className="text-3xl font-bold text-primary">
                {loading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats.totalImages}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-none shadow-none">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 rounded-full bg-green-500/20">
              <Eye className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Public Images</div>
              <div className="text-3xl font-bold text-green-500">
                {loading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats.publicImages}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-none shadow-none">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 rounded-full bg-blue-500/20">
              <EyeOff className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Private Images</div>
              <div className="text-3xl font-bold text-blue-500">
                {loading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats.privateImages}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsCards;
