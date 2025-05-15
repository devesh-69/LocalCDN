
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RegisterAvatarProps {
  username: string;
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RegisterAvatar = ({ 
  username, 
  avatarPreview, 
  onAvatarChange 
}: RegisterAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center mb-4">
      <div 
        className="relative cursor-pointer mb-2" 
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarPreview || undefined} />
          <AvatarFallback className="text-lg">
            {username ? username[0].toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
          <Upload size={12} className="text-white" />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarChange}
        className="hidden"
      />
      <span className="text-xs text-muted-foreground">
        Click to upload profile picture (optional)
      </span>
    </div>
  );
};
