import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Link2, LogOut, LayoutDashboard, Home, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 glass-panel transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Link2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                SnapLink
              </span>
            </Link>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Nav links */}
            <div className="hidden md:flex items-center space-x-2 mr-2">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              {user && (
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border/50"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-semibold text-foreground">{user.name}</span>
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                
                {/* Mobile Dash Link */}
                <Link 
                  to="/dashboard" 
                  className="md:hidden p-2 rounded-lg bg-secondary text-foreground hover:bg-muted border border-border/50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium border border-indigo-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary border border-border/50 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="px-3.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium shadow-md shadow-indigo-500/15 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
