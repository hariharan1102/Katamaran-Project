import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import Navbar from '../components/Navbar';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ArrowLeft, Calendar, BarChart3, Clock, Globe, ArrowRight, Laptop, Link2, AlertCircle, RefreshCw } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const PublicStats = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  // Fetch public statistics using React Query
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['publicStats', shortCode],
    queryFn: async () => {
      const res = await apiFetch(`/urls/public/${shortCode}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch public stats');
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Loading public metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Stats Not Found</h2>
          <p className="text-muted-foreground text-sm">We couldn't retrieve statistics for this short code. The link may not exist or has been deleted.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const { urlInfo, totalClicks, lastVisitedAt, recentVisits, dailyClickTrend, deviceBreakdown, browserBreakdown } = analytics;
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  const shortLink = `${serverUrl}/${urlInfo.shortCode}`;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Background blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-[80px] -z-10" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title Block */}
        <div className="space-y-4 border-b border-border/40 pb-6">
          <div className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full">
            <Link2 className="h-3 w-3" />
            <span>Public Link Statistics</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">/{urlInfo.shortCode}</h1>
              <p className="text-xs text-muted-foreground select-all font-mono break-all">{shortLink}</p>
            </div>
            
            <a 
              href={shortLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold flex items-center space-x-2 transition-all shadow-md shadow-indigo-500/15"
            >
              <span>Visit Shortened Link</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          {/* Total clicks */}
          <div className="glass-panel p-5 rounded-2xl border border-border/50 flex items-center space-x-4">
            <div className="h-10 w-10 bg-indigo-500/15 text-indigo-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-semibold">Total Clicks</span>
              <span className="text-2xl font-black text-foreground mt-0.5">{totalClicks}</span>
            </div>
          </div>

          {/* Last visit */}
          <div className="glass-panel p-5 rounded-2xl border border-border/50 flex items-center space-x-4">
            <div className="h-10 w-10 bg-amber-500/15 text-amber-500 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-semibold">Last Click</span>
              <span className="text-sm font-bold text-foreground mt-1 block truncate max-w-[200px]">
                {lastVisitedAt ? new Date(lastVisitedAt).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>

          {/* Date created */}
          <div className="glass-panel p-5 rounded-2xl border border-border/50 flex items-center space-x-4">
            <div className="h-10 w-10 bg-emerald-500/15 text-emerald-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-semibold">Created Date</span>
              <span className="text-sm font-bold text-foreground mt-1 block">
                {new Date(urlInfo.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Click Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4">
          <h3 className="text-base font-bold text-foreground pl-1">Daily Click Trend (Last 7 Days)</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyClickTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="date" stroke="rgb(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="rgb(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser & Device Breakdown Side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Device Pie Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4 flex flex-col">
            <h3 className="text-base font-bold text-foreground flex items-center space-x-2 pl-1">
              <Laptop className="h-4 w-4 text-indigo-500" />
              <span>Device Breakdown</span>
            </h3>
            
            {deviceBreakdown.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
                No device clicks logged.
              </div>
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
                <div className="w-44 h-44 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 space-y-2 w-full">
                  {deviceBreakdown.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-semibold text-foreground">{entry.name}</span>
                      </div>
                      <span className="text-muted-foreground font-bold">{entry.value} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Browser Pie Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4 flex flex-col">
            <h3 className="text-base font-bold text-foreground flex items-center space-x-2 pl-1">
              <Globe className="h-4 w-4 text-indigo-500" />
              <span>Browser Breakdown</span>
            </h3>
            
            {browserBreakdown.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
                No browser clicks logged.
              </div>
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
                <div className="w-44 h-44 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={browserBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {browserBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 space-y-2 w-full">
                  {browserBreakdown.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-semibold text-foreground">{entry.name}</span>
                      </div>
                      <span className="text-muted-foreground font-bold">{entry.value} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Public Recent 10 Visits (No IP Address column to preserve privacy!) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Public Visitor Log (Privacy Preserved)</h2>
          
          {recentVisits.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center border border-border/50 text-sm text-muted-foreground">
              No clicks recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border glass-panel">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/70 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Browser</th>
                    <th className="p-3.5">Device</th>
                    <th className="p-3.5">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-background/20">
                  {recentVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-secondary/25 transition-colors">
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(visit.visitedAt).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-medium">{visit.browser}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-xs font-semibold">
                          {visit.device}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-foreground">{visit.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default PublicStats;
