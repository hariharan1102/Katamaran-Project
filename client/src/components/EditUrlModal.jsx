import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { X, Save, AlertCircle, RefreshCw } from 'lucide-react';

const EditUrlModal = ({ isOpen, onClose, urlId, currentOriginalUrl, onSuccess }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentOriginalUrl) {
      setOriginalUrl(currentOriginalUrl);
    }
  }, [currentOriginalUrl, isOpen]);

  if (!isOpen) return null;

  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let targetUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    if (!isValidUrl(targetUrl)) {
      setError('Invalid URL format. Must start with http:// or https://');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(`/urls/${urlId}`, {
        method: 'PATCH',
        body: JSON.stringify({ originalUrl: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update URL');
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl relative border border-border/50 animate-scale-in">
        
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <h3 className="text-lg font-bold text-foreground mb-4">Edit Destination URL</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Destination URL
            </label>
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter new destination URL..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-foreground"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center space-x-1.5 animate-scale-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium text-foreground transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-500/10 disabled:opacity-75 cursor-pointer"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditUrlModal;
