import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Lock, Mail, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative Glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] -z-10" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl border border-border/50 animate-scale-in">
          
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto h-11 w-11 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/10">
              <UserPlus className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
            <p className="text-sm text-muted-foreground">Sign up to get custom aliases and advanced analytics</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-foreground"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-foreground"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-foreground"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-2 animate-scale-in">
                <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>Register</span>
              )}
            </button>

          </form>

          {/* Foot link */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
