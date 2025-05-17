
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { RegisterAvatar } from './RegisterAvatar';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, signInWithGoogle } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const watchUsername = watch('username', '');
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar image must be less than 2MB");
        return;
      }
      
      setAvatarFile(file);
      
      // Create URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!data.username) {
      toast.error("Username is required.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await registerUser(data.email, data.username, data.password, avatarFile || undefined);
      if (success) {
        const from = location.state?.from?.pathname || '/gallery';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="space-y-4">
        <GoogleSignInButton 
          onClick={handleGoogleSignIn} 
          isLoading={isGoogleLoading}
          text="Sign up with Google"
        />
        
        <div className="flex items-center gap-2 my-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        
        <RegisterAvatar 
          username={watchUsername}
          avatarPreview={avatarPreview}
          onAvatarChange={handleAvatarChange}
        />

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            type="text" 
            placeholder="johndoe" 
            className="bg-secondary/50"
            {...register('username', { required: true })}
          />
          {errors.username && (
            <p className="text-sm text-destructive">Username is required</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            className="bg-secondary/50"
            {...register('email', { 
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            })}
          />
          {errors.email && (
            <p className="text-sm text-destructive">Valid email is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="bg-secondary/50"
            {...register('password', { required: true, minLength: 6 })}
          />
          {errors.password && (
            <p className="text-sm text-destructive">Password must be at least 6 characters</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="••••••••" 
            className="bg-secondary/50"
            {...register('confirmPassword', { 
              required: true,
              validate: (value) => value === watch('password')
            })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">Passwords must match</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90" 
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Register"}
        </Button>
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </form>
  );
};
