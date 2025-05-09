'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Container } from '@/components/layout/Container';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, curr) => {
          const field = curr.path[0] as keyof ForgotPasswordFormData;
          acc[field] = curr.message;
          return acc;
        }, {} as Partial<ForgotPasswordFormData>);
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // For now, we'll simulate a successful response
      // In a real implementation, you would call an API endpoint
      setTimeout(() => {
        setMessage({
          type: 'success',
          text: 'If an account exists with this email, you will receive password reset instructions shortly.',
        });
        setFormData({ email: '' });
        setIsLoading(false);
      }, 1500);
      
      // Real implementation example:
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email: formData.email,
      //   }),
      // });
      //
      // if (!response.ok) {
      //   const data = await response.json();
      //   setMessage({ type: 'error', text: data.error || 'Request failed' });
      // } else {
      //   setMessage({
      //     type: 'success',
      //     text: 'If an account exists with this email, you will receive password reset instructions shortly.',
      //   });
      //   setFormData({ email: '' });
      // }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <Container>
      <div className="flex min-h-[calc(100vh-200px)] flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            {message && (
              <div
                className={`mb-4 rounded-md ${
                  message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                } p-4`}
              >
                <div className="flex">
                  <div
                    className={`text-sm ${
                      message.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or go back to
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/auth/signin"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
} 