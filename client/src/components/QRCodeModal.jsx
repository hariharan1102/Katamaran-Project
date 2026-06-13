import React from 'react';
import { X, Download } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, shortCode }) => {
  if (!isOpen) return null;

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  const qrUrl = `${serverUrl}/api/urls/${shortCode}/qr`;
  const redirectUrl = `${serverUrl}/${shortCode}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snaplink-${shortCode}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('QR download failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel p-6 rounded-2xl shadow-2xl relative border border-border/50 animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <h3 className="text-lg font-bold text-foreground mb-1 pr-6">QR Code</h3>
        <p className="text-xs text-indigo-500 font-semibold select-all break-all mb-6">
          {redirectUrl}
        </p>

        {/* QR Image */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-border/50 shadow-inner mb-6">
          <img 
            src={qrUrl} 
            alt={`QR Code for ${shortCode}`}
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Action button */}
        <button
          onClick={handleDownload}
          className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Download QR Code</span>
        </button>

      </div>
    </div>
  );
};

export default QRCodeModal;
