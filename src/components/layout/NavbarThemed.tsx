
import React from 'react';
import Navbar from './Navbar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface NavbarThemedProps {
  className?: string;
}

const NavbarThemed = ({ className }: NavbarThemedProps) => {
  return (
    <div className={className}>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Navbar />
    </div>
  );
};

export default NavbarThemed;
