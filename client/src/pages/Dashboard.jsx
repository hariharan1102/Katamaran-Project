import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import Navbar from '../components/Navbar';
import UrlShortenerForm from '../components/UrlShortenerForm';
import UrlTable from '../components/UrlTable';
import QRCodeModal from '../components/QRCodeModal';
import EditUrlModal from '../components/EditUrlModal';
import BulkUploadModal from '../components/BulkUploadModal';
import { Plus, BarChart3, Database, FileSpreadsheet, RefreshCw, Layers, Sparkles, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [qrCodeTarget, setQrCodeTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Fetch URLs using React Query
  const { data: urls = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['urls'],
    queryFn: async () => {
      const res = await apiFetch('/urls');
      if (!res.ok) {
        throw new Error('Failed to fetch URLs');
      }
      return res.json();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/urls/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete URL');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shortened link? All visit logs will be deleted permanently.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEditClick = (id, currentOriginalUrl) => {
    setEditTarget({ id, currentOriginalUrl });
  };

  const handleQrClick = (shortCode) => {
    setQrCodeTarget(shortCode);
  };

  // Stats cards calculations
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgClicks = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0;
  
  const mostPopular = totalUrls > 0 
    ? [...urls].sort((a, b) => b.clicks - a.clicks)[0] 
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Background blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-[80px] -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-[80px] -z-10" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your shortened links and monitor performance statistics.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBulkOpen(true)}
              className="px-4 py-2.5 rounded-lg border border-border hover:bg-secondary text-sm font-semibold text-foreground flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Bulk Shorten (CSV)</span>
            </button>
            <button
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="p-2.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Links"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {/* Card 1: Total links */}
          <div className="glass-panel p-5 rounded-2xl border border-border/50 flex items-center space-x-4">
            <div className="h-10 w-10 bg-indigo-500/15 text-indigo-500 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Links</span>
              <span className="text-2xl font-black text-foreground mt-0.5">{totalUrls}</span>
            </div>
          </div>

          {/* Card 2: Total clicks */}
          <div className="glass-panel p-5 rounded-2xl border border-border/50 flex items-center space-x-4">
            <div className="h-10 w-10 bg-emerald-500/15 text-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Clicks</span>
              <span className="text-2xl font-black text-foreground mt-0.5">{totalClicks}</span>
            </div>
          </div>

          {/* Card 3: Avg click rate */}
          <div className="glass-panel p-5 rounded-2xl border border-border/50 flex items-center space-x-4">
            <div className="h-10 w-10 bg-purple-500/15 text-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Avg. Click Rate</span>
              <span className="text-2xl font-black text-foreground mt-0.5">{avgClicks}</span>
            </div>
          </div>

          {/* Card 4: Most Popular */}
          <div className="glass-panel p-5 rounded-2xl border border-border/50 flex items-center space-x-4">
            <div className="h-10 w-10 bg-pink-500/15 text-pink-500 rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Most Popular</span>
              <span className="text-sm font-bold text-foreground truncate block mt-0.5">
                {mostPopular ? `/${mostPopular.shortCode} (${mostPopular.clicks})` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Link Shortening Form inside dashboard */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Create New Link</h2>
          <UrlShortenerForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['urls'] })} />
        </div>

        {/* Short URLs List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">My Shortened Links</h2>
          
          {isLoading ? (
            /* Skeleton Table Loader */
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-border/50">
              <div className="h-8 bg-secondary rounded-lg animate-pulse w-1/4" />
              <div className="space-y-3 pt-2">
                <div className="h-12 bg-secondary rounded-lg animate-pulse" />
                <div className="h-12 bg-secondary rounded-lg animate-pulse" />
                <div className="h-12 bg-secondary rounded-lg animate-pulse" />
              </div>
            </div>
          ) : urls.length === 0 ? (
            /* Empty State Illustration */
            <div className="glass-panel p-12 rounded-2xl text-center border border-border/50 space-y-4">
              <div className="mx-auto h-16 w-16 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold">No shortened links yet</h3>
                <p className="text-sm text-muted-foreground">Shorten your first URL using the form above or import links in bulk from a CSV template.</p>
              </div>
            </div>
          ) : (
            /* URLs Table Component */
            <UrlTable
              urls={urls}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onQrShow={handleQrClick}
            />
          )}
        </div>

      </main>

      {/* Modals and Dialogs */}
      <QRCodeModal
        isOpen={!!qrCodeTarget}
        onClose={() => setQrCodeTarget(null)}
        shortCode={qrCodeTarget}
      />

      <EditUrlModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        urlId={editTarget?.id}
        currentOriginalUrl={editTarget?.currentOriginalUrl}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['urls'] })}
      />

      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['urls'] })}
      />
    </div>
  );
};

export default Dashboard;
