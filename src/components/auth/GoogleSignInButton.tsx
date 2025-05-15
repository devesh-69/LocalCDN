
import React from 'react';
import { Button } from '@/components/ui/button';

interface GoogleSignInButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  text: string;
}

export const GoogleSignInButton = ({ 
  onClick, 
  isLoading, 
  variant = "outline",
  text
}: GoogleSignInButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant}
      className="w-full flex items-center justify-center gap-2"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        "Connecting..."
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M2 12h10" />
            <path d="M12 2v10" />
            <path d="M12 12 4.93 19.07" />
            <path d="M12 12 19.07 4.93" />
          </svg>
          {text}
        </>
      )}
    </Button>
  );
};
