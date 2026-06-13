import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, BarChart3, QrCode, Edit, Trash2, Search, ChevronLeft, ChevronRight, ExternalLink, Calendar } from 'lucide-react';

const UrlTable = ({ urls, onEdit, onDelete, onQrShow }) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  const handleCopy = async (id, shortCode) => {
    const redirectUrl = `${serverUrl}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(redirectUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Filter urls based on search term (searches original URL or shortCode / alias)
  const filteredUrls = urls.filter(
    (url) =>
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (url.customAlias && url.customAlias.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination math
  const totalPages = Math.ceil(filteredUrls.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUrls.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search original URL or short link..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
      </div>

      {filteredUrls.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-border/40">
          <p className="text-muted-foreground text-sm font-medium">No shortened links found matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="overflow-x-auto rounded-xl border border-border glass-panel">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/70 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Original URL</th>
                  <th className="p-4">Shortened URL</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Clicks</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm text-foreground bg-background/20">
                {currentItems.map((url) => {
                  const expired = isExpired(url.expiresAt);
                  const shortenedLink = `${serverUrl}/${url.shortCode}`;
                  
                  return (
                    <tr key={url.id} className="hover:bg-secondary/35 transition-colors group">
                      
                      {/* Original URL */}
                      <td className="p-4 max-w-[220px]">
                        <div className="flex flex-col">
                          <a 
                            href={url.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-medium hover:text-indigo-500 flex items-center space-x-1 truncate max-w-full"
                          >
                            <span className="truncate">{url.originalUrl}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </a>
                          {url.customAlias && (
                            <span className="text-[10px] text-indigo-500 font-semibold mt-0.5">
                              Alias: {url.customAlias}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Short Link */}
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-indigo-500 select-all font-mono">
                            /{url.shortCode}
                          </span>
                          <button
                            onClick={() => handleCopy(url.id, url.shortCode)}
                            className="p-1.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Copy Short URL"
                          >
                            {copiedId === url.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="p-4 text-muted-foreground">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>

                      {/* Clicks */}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {url.clicks}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="p-4">
                        {url.expiresAt ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${expired ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                            {expired ? 'Expired' : new Date(url.expiresAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          
                          <button
                            onClick={() => navigate(`/analytics/${url.id}`)}
                            className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 text-muted-foreground transition-all cursor-pointer"
                            title="Analytics Dashboard"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onQrShow(url.shortCode)}
                            className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 text-muted-foreground transition-all cursor-pointer"
                            title="QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onEdit(url.id, url.originalUrl)}
                            className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 text-muted-foreground transition-all cursor-pointer"
                            title="Edit URL"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onDelete(url.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all cursor-pointer"
                            title="Delete URL"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/40 pt-4 px-1">
              <span className="text-xs text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUrls.length)} of {filteredUrls.length} entries
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`h-9 w-9 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${currentPage === i + 1 ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/10' : 'border-border hover:bg-secondary text-muted-foreground'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UrlTable;
