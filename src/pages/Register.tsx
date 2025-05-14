
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Google } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, signInWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/gallery';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!username) {
      toast.error("Username is required.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(email, username, password, avatarFile || undefined);
      if (success) {
        const from = location.state?.from?.pathname || '/gallery';
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signInWithGoogle();
    setIsGoogleLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background/80 to-background">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details to create a new account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Connecting..."
              ) : (
                <>
                  <Google size={16} />
                  Sign up with Google
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 my-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
          
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
                onChange={handleAvatarChange}
                className="hidden"
              />
              <span className="text-xs text-muted-foreground">
                Click to upload profile picture (optional)
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="johndoe" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                className="bg-secondary/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                className="bg-secondary/50"
              />
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
      </Card>
    </div>
  );
};

export default Register;
