
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/gallery';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background/80 to-background">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details to create a new account</CardDescription>
        </CardHeader>
        <RegisterForm />
      </Card>
    </div>
  );
};

export default Register;
