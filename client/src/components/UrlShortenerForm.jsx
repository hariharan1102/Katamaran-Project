import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { Link2, Sparkles, Calendar, Lock, Copy, Check, Download, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';

const UrlShortenerForm = ({ onSuccess }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Real-time URL validation
  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const clientUrl = window.location.origin;
    // Redirection happens via server: BASE_URL/:shortCode
    // Wait, the shortened URL should redirect. The actual redirect endpoint is http://localhost:5000/:shortCode (server port 5000).
    // Let's copy the redirection URL: http://localhost:5000/:shortCode
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    const redirectUrl = `${serverUrl}/${result.shortCode}`;
    
    try {
      await navigator.clipboard.writeText(redirectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadQR = async () => {
    if (!result) return;
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${serverUrl}/api/urls/${result.shortCode}/qr`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snaplink-${result.shortCode}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('QR download failed', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!originalUrl) {
      setError('Please enter a URL to shorten');
      return;
    }

    let urlToShorten = originalUrl.trim();
    if (!/^https?:\/\//i.test(urlToShorten)) {
      urlToShorten = 'https://' + urlToShorten;
    }

    if (!isValidUrl(urlToShorten)) {
      setError('Invalid URL format. Must start with http:// or https://');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/urls', {
        method: 'POST',
        body: JSON.stringify({
          originalUrl: urlToShorten,
          customAlias: customAlias.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setResult(data);
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl shadow-xl border border-border/50 animate-fade-in">
        
        {/* Main Input */}
        <div className="relative flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Paste your long URL here... (e.g. google.com)"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 focus:bg-background focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-foreground text-base transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Shorten</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Inline validation message */}
        {originalUrl && !isValidUrl(/^https?:\/\//i.test(originalUrl) ? originalUrl : 'https://' + originalUrl) && (
          <p className="mt-2 text-xs text-amber-500 flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>URL doesn't look fully valid yet, we'll prepended https:// for you if needed.</span>
          </p>
        )}

        {/* Advanced Options Accordion */}
        <div className="mt-4 border-t border-border/40 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span>Advanced Settings (Custom Alias, Expiry)</span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
              {/* Custom Alias */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center space-x-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Custom Alias (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. my-promo-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Expiry Date (Optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-muted-foreground focus:text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-2 animate-scale-in">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </form>

      {/* Success Result Card */}
      {result && (
        <div className="glass-panel p-6 rounded-2xl shadow-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/5 animate-scale-in">
          <h3 className="text-lg font-bold text-foreground mb-4">Link Shortened Successfully!</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Link details */}
            <div className="flex-1 space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Short Link</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-indigo-500 select-all break-all">
                    {`${serverUrl}/${result.shortCode}`}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Original Destination</span>
                <p className="text-sm text-muted-foreground break-all max-h-16 overflow-y-auto pr-1">
                  {result.originalUrl}
                </p>
              </div>

              {result.expiresAt && (
                <div className="text-xs text-amber-500 flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Expires on: {new Date(result.expiresAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-background dark:bg-card rounded-xl border border-border/60 shadow-sm max-w-[180px] mx-auto md:mx-0">
              <img 
                src={`${serverUrl}/api/urls/${result.shortCode}/qr`} 
                alt="QR Code"
                className="w-32 h-32 object-contain"
              />
              <button
                onClick={handleDownloadQR}
                className="mt-2.5 flex items-center space-x-1 text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Download QR</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortenerForm;
