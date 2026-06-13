import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import UrlShortenerForm from '../components/UrlShortenerForm';
import { Link2, BarChart3, Shield, QrCode, ArrowRight, Zap, CheckCircle } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Hero Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-7xl mx-auto w-full relative">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl space-y-6 mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Zap className="h-3.5 w-3.5" />
            <span>Fast, Reliable URL Shortening & Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
            Shorten Your Links,{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Amplify Your Reach
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Create custom short codes, track real-time click statistics (browser, device, country), set expiry links, and generate high-resolution QR codes.
          </p>

          {/* Call to actions */}
          {!user && (
            <div className="flex items-center justify-center space-x-3 pt-2">
              <Link
                to="/register"
                className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 flex items-center space-x-1 transition-all hover:scale-[1.02]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-xl bg-secondary text-foreground hover:bg-muted border border-border/50 text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* URL Shortener Form Component */}
        <UrlShortenerForm />

        {/* Feature Highlights Grid */}
        <div className="mt-20 md:mt-28 w-full">
          <h2 className="text-2xl font-extrabold text-center text-foreground mb-12">
            Why Choose SnapLink?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Custom Branding */}
            <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4 hover:border-indigo-500/20 transition-all">
              <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                <Link2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Custom Branded Links</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Create custom aliases for your short urls to boost brand recognition and click-through rates.
              </p>
            </div>

            {/* Card 2: QR Codes */}
            <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4 hover:border-indigo-500/20 transition-all">
              <div className="h-10 w-10 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Automatic QR Codes</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Every shortened link generates a downloadable QR code immediately to share in print or digital media.
              </p>
            </div>

            {/* Card 3: Deep Analytics */}
            <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4 hover:border-indigo-500/20 transition-all">
              <div className="h-10 w-10 bg-pink-500/10 text-pink-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Deep Click Analytics</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Log real-time visitor details (devices, browsers, and countries) and visualize weekly trends instantly.
              </p>
            </div>

          </div>
        </div>

        {/* Trust banner */}
        <div className="mt-16 md:mt-24 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground/60 w-full flex items-center justify-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-500/60" />
          <span>Fully compliant JWT authentication • Real-time database tracking • Free Open Source tool</span>
        </div>

      </main>

      <footer className="py-6 border-t border-border/40 bg-secondary/15 text-center text-xs text-muted-foreground">
        <p>This project is a part of a hackathon run by <a href="https://katomaran.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground font-semibold">https://katomaran.com</a></p>
      </footer>
    </div>
  );
};

export default Landing;
