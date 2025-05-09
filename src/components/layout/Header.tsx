'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Upload', href: '/upload' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Profile', href: '/profile' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full header-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link 
            href="/" 
            className="font-secondary text-primary text-2xl font-bold"
          >
            LocalCDN
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text hover:text-primary transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            className="hidden md:block btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Sign In
          </button>
          
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/upload'}
          >
            Upload
          </button>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass p-4 mx-4 my-2 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-text hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="btn-primary text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
} 