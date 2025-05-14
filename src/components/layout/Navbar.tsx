
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, LogOut, Search, Home, GalleryHorizontal, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
            <NavLink to="/">
              <Home size={16} className="mr-2 inline-block" />
              Home
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard">
                  <LayoutDashboard size={16} className="mr-2 inline-block" />
                  Dashboard
                </NavLink>
                <NavLink to="/gallery">
                  <GalleryHorizontal size={16} className="mr-2 inline-block" />
                  Gallery
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {isAuthenticated && user ? (
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
              <Link to="/upload" className="flex items-center">
                <Upload size={16} className="mr-2" /> Upload
              </Link>
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
