'use client';

import { useSession, signOut } from 'next-auth/react';
import { Container } from '@/components/layout/Container';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <Container>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                Dashboard
              </h2>
              <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
                Welcome, {session?.user?.name}!
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                This is your protected dashboard page. You can only see this page if you are
                authenticated.
              </p>
            </div>

            <div className="mt-10">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Details about your account.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Full name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {session?.user?.name}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Email address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {session?.user?.email}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        User ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {session?.user?.id || 'Not available'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  );
} 