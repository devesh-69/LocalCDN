
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, LogOut, User, Search } from 'lucide-react';

const Navbar = () => {
  // For MVP, we'll simulate authentication state
  const isAuthenticated = false;
  const userEmail = "user@example.com";

  return (
    <header className="glass-navbar sticky top-0 z-50 w-full py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-primary text-2xl font-bold">localCDN</div>
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search images..."
                className="pl-10 h-9 w-64 rounded-md border bg-secondary/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline" className="glass-effect" size="sm">
              <Upload size={16} className="mr-2" /> Upload
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User size={16} />
              <span>{userEmail}</span>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" className="glass-effect">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/80">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
