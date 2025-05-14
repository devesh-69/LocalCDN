
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, LogOut, User, Search, Home, Gallery } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const Navbar = () => {
  const location = useLocation();
  // For MVP, we'll simulate authentication state
  const isAuthenticated = true; // Changed to true for demonstration
  const user = {
    username: "demo_user",
    email: "user@example.com",
    avatarUrl: null
  };

  const handleLogout = () => {
    // In a real application, this would clear the session
    toast.success("Successfully logged out");
    // You would then redirect to login page
  };

  const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`px-3 py-2 ${isActive ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="glass-navbar sticky top-0 z-50 w-full py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-primary text-2xl font-bold">localCDN</div>
          </Link>

          <nav className="hidden md:flex items-center gap-4 ml-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/gallery">Gallery</NavLink>
            <NavLink to="/upload">Upload</NavLink>
          </nav>
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
            <Button variant="outline" className="glass-effect" size="sm" as={Link} to="/upload">
              <Upload size={16} className="mr-2" /> Upload
            </Button>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">{user.username}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
