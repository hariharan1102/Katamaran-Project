import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { apiFetch } from '../utils/api';
import { X, Upload, FileSpreadsheet, Play, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setError('');
    setSuccessResult(null);
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file (.csv)');
      return;
    }

    setSelectedFile(file);

    // Parse locally for preview
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data.slice(0, 5)); // Preview first 5 rows
      },
      error: (err) => {
        setError('Error parsing CSV: ' + err.message);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError('');
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file (.csv)');
        return;
      }
      setSelectedFile(file);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results.data.slice(0, 5));
        },
        error: (err) => {
          setError('Error parsing CSV: ' + err.message);
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await apiFetch('/urls/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to bulk shorten URLs');
      }

      setSuccessResult({
        successCount: data.successCount,
        errorCount: data.errorCount,
        errors: data.errors || [],
      });

      setSelectedFile(null);
      setPreviewData([]);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,originalUrl,customAlias,expiresAt\nhttps://google.com,google-home,\nhttps://github.com,github-profile,2026-12-31T23:59:59Z\nhttps://react.dev,,\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "snaplink_bulk_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setError('');
    setSuccessResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl shadow-2xl relative border border-border/50 animate-scale-in">
        
        {/* Close */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <h3 className="text-xl font-bold text-foreground mb-1">Bulk URL Shortening</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a CSV file containing links to shorten multiple URLs simultaneously.
        </p>

        {!successResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Drag & Drop Area */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-border hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-all group"
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-indigo-500 mb-3 transition-colors" />
              <span className="text-sm font-semibold text-foreground">
                {selectedFile ? selectedFile.name : 'Click or Drag & Drop to upload CSV'}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                CSV file up to 2MB. Columns: originalUrl, customAlias (optional), expiresAt (optional)
              </span>
            </div>

            {/* Template Downloader */}
            <div className="flex justify-between items-center bg-secondary/50 px-4 py-2.5 rounded-lg border border-border/50 text-xs">
              <span className="text-muted-foreground">Need a starting template?</span>
              <button 
                type="button"
                onClick={downloadSampleCsv}
                className="text-indigo-500 hover:text-indigo-600 font-semibold cursor-pointer"
              >
                Download Sample CSV
              </button>
            </div>

            {/* Preview table (local) */}
            {previewData.length > 0 && (
              <div className="space-y-2 animate-scale-in">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>CSV Preview (First 5 Rows)</span>
                </span>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-secondary/80 border-b border-border font-semibold text-muted-foreground">
                        <th className="p-2">Original URL</th>
                        <th className="p-2">Custom Alias</th>
                        <th className="p-2">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background/50">
                      {previewData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 max-w-[200px] truncate">{row.originalUrl || row.url || '—'}</td>
                          <td className="p-2">{row.customAlias || row.alias || '—'}</td>
                          <td className="p-2">{row.expiresAt || row.expiry || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-2 animate-scale-in">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                <span>Process CSV</span>
              </button>
            </div>

          </form>
        ) : (
          /* Success Result Summary Card */
          <div className="space-y-4 animate-scale-in">
            <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold text-sm">Bulk Processing Finished!</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 border border-border/50 rounded-xl text-center">
                <span className="text-2xl font-black text-indigo-500">{successResult.successCount}</span>
                <span className="text-xs text-muted-foreground block font-medium mt-1">Successfully Shortened</span>
              </div>
              <div className="p-4 bg-secondary/30 border border-border/50 rounded-xl text-center">
                <span className="text-2xl font-black text-amber-500">{successResult.errorCount}</span>
                <span className="text-xs text-muted-foreground block font-medium mt-1">Errors/Failed</span>
              </div>
            </div>

            {/* Row Errors (if any) */}
            {successResult.errors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-destructive uppercase tracking-wider">Error Details</span>
                <div className="max-h-40 overflow-y-auto border border-border rounded-xl bg-background/50 divide-y divide-border text-xs text-muted-foreground p-2">
                  {successResult.errors.map((err, idx) => (
                    <div key={idx} className="py-2 px-1 flex items-start justify-between gap-4">
                      <span>Row {err.row}: {err.url ? <span className="font-mono text-[10px] bg-secondary px-1 py-0.5 rounded break-all">{err.url}</span> : ''}</span>
                      <span className="text-destructive font-medium">{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BulkUploadModal;
