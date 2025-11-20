import React, { useState, useEffect } from 'react';
import apiService from '../apiService';
import './PartChooser.css';

// 1 USD = 88.7 INR
const USD_TO_INR_RATE = 88.7;

// Helper function to make header names look nice
const formatHeader = (header) => {
  return header
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};


// Logo helper that uses Clearbit Logo API (returns a small PNG) for common manufacturers
const getLogoByManufacturer = (manufacturer) => {
  if (!manufacturer) return '';
  const m = manufacturer.toLowerCase();

  const map = [
    ['intel', 'intel.com'],
    ['amd', 'amd.com'],
    ['nvidia', 'nvidia.com'],
    ['asus', 'asus.com'],
    ['gigabyte', 'gigabyte.com'],
    ['msi', 'msi.com'],
    ['asrock', 'asrock.com'],
    ['corsair', 'corsair.com'],
    ['kingston', 'kingston.com'],
    ['samsung', 'samsung.com'],
    ['cooler master', 'coolermaster.com'],
    ['lian li', 'lian-li.com'],
    ['seagate', 'seagate.com'],
    ['western digital', 'westerndigital.com'],
    ['wd', 'westerndigital.com'],
    ['lg', 'lg.com'],
    ['dell', 'dell.com']
  ];

  for (const [key, domain] of map) {
    if (m.includes(key)) {
      return `https://logo.clearbit.com/${domain}?size=80`;
    }
  }

  return '';
};

function PartChooser({ category, onPartSelect, onCancel, currentBuild }) {
  const [parts, setParts] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for pagination (when compatibleOnly is OFF)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(999999);
  
  // State for compatibility
  const [compatibleOnly, setCompatibleOnly] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Used for search *or* compat filter

  /**
   * This is the main data loading effect.
   * It now decides *what* to fetch based on the compatibleOnly toggle.
   */
  useEffect(() => {
    const loadParts = () => {
      // Don't run if we are searching (handleSearch will run instead)
      
      if (isSearching && !compatibleOnly) return;
      setLoading(true);
      setError('');
      
      if (compatibleOnly) {
        setIsSearching(true); // Treat this like a search (no pagination)
        setTotalPages(1);

        if (category === 'psus') {
          // Use new PSU compatibility API
          const gpuId = currentBuild.gpu?.id || null;
          const caseId = currentBuild.case?.id || null;
          if (gpuId && caseId) {
            apiService.getCompatiblePSUs(gpuId, caseId)
              .then(res => {
                const compatibleParts = res.data.compatible_psus;
                setParts(compatibleParts);
                if (compatibleParts.length > 0) {
                  setHeaders(Object.keys(compatibleParts[0]));
                }
                setLoading(false);
              })
              .catch(err => {
                console.error(err);
                setError('Failed to load compatible PSUs.');
                setLoading(false);
              });
          } else {
            setParts([]);
            setLoading(false);
          }
        } else {
          // Use generic compatibility API for other categories
          const buildState = {
            cpu_id: currentBuild.cpu?.id || null,
            motherboard_id: currentBuild.motherboard?.id || null,
            ram_id: currentBuild.ram?.id || null,
            gpu_id: currentBuild.gpu?.id || null,
            case_id: currentBuild.case?.id || null,
            psu_id: currentBuild.psu?.id || null
          };
          apiService.getCompatibleParts(category, buildState)
            .then(res => {
              const compatibleParts = res.data.compatible_parts;
              setParts(compatibleParts);
              if (compatibleParts.length > 0) {
                setHeaders(Object.keys(compatibleParts[0]));
              }
              setLoading(false);
            })
            .catch(err => {
              console.error(err);
              setError('Failed to load compatible parts.');
              setLoading(false);
            });
        }
      } else {
        // --- NORMAL MODE: FETCH PAGINATED ---
        setIsSearching(false);
        apiService.fetchParts(category, page)
          .then(res => {
            setParts(res.data.data);
            setTotalPages(res.data.total_pages);
            if (res.data.data.length > 0) {
              setHeaders(Object.keys(res.data.data[0]));
            }
            setLoading(false);
          })
          .catch(err => {
            setError('Failed to load parts.');
            setLoading(false);
          });
      }
    };
    
    loadParts();
  }, [category, page, compatibleOnly, currentBuild]); // Re-run on all these changes


  /**
   * This handles the search button.
   * It does *not* mix with the compatibility toggle.
   */
  const handleSearch = () => {
    setLoading(true);
    setError('');
    setPage(1);
    setTotalPages(1);
    setIsSearching(true); // This is now a search
    setCompatibleOnly(false); // Turn off toggle when searching

    try {
      const minPriceUSD = minPrice / USD_TO_INR_RATE;
      const maxPriceUSD = maxPrice / USD_TO_INR_RATE;
      
      apiService.searchParts(category, searchTerm, minPriceUSD, maxPriceUSD)
        .then(res => {
            let searchedParts = res.data.search_results;
            if (searchedParts.length > 0) {
                setHeaders(Object.keys(searchedParts[0]));
            }
            setParts(searchedParts);
            setLoading(false);
        });

    } catch (err) {
      setError('Search failed.');
      setLoading(false);
    }
  };
  
  const clearSearch = () => {
      setSearchTerm('');
      setMinPrice(0);
      setMaxPrice(999999);
      setIsSearching(false); // Go back to pagination
      setCompatibleOnly(false); // Ensure toggle is off
      setPage(1); // Go to page 1
  };
  
  // When toggling, reset to page 1
  const handleToggleChange = () => {
      setPage(1);
      setIsSearching(compatibleOnly ? false : true); // If we're turning it ON, it's a "search"
      setCompatibleOnly(!compatibleOnly);
  };


  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{textTransform: 'capitalize'}}>Choose {category}</h2>
          <button onClick={onCancel} className="modal-close-button">&times;</button>
        </div>
        
        {/* Search Bar */}
        <div className="modal-search-bar">
            <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
            />
            <input 
                type="number" 
                placeholder="Min Price (INR)" 
                value={minPrice} 
                onChange={e => setMinPrice(e.target.value)}
            />
            <input 
                type="number" 
                placeholder="Max Price (INR)" 
                value={maxPrice} 
                onChange={e => setMaxPrice(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={clearSearch}>Clear Search</button>
        </div>
        
        {/* Compatibility Toggle */}
        <div className="modal-toggle-bar">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={compatibleOnly} 
              onChange={handleToggleChange}
            />
            <span className="slider"></span>
          </label>
          <span>Only show compatible parts</span>
          {loading && isSearching && <span className="compat-loader">Filtering...</span>}
        </div>
        
        {/* Dynamic Table */}
        <div className="modal-body">
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          
          {!loading && !error && parts.length > 0 && (
            <table className="chooser-table">
              <thead>
                <tr>
                  <th key="logo-header"></th>
                  {headers.map(header => (
                    <th key={header}>{formatHeader(header)}</th>
                  ))}
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {parts.map(part => (
                  <tr key={part.id}>
                    <td>
                      {part.manufacturer ? (
                        <img
                          src={getLogoByManufacturer(part.manufacturer)}
                          alt={part.manufacturer}
                          style={{ height: 28, maxWidth: 120 }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                    </td>
                    {headers.map(header => (
                      <td key={`${part.id}-${header}`}>
                        {header === 'price'
                          ? `₹${(part[header] * USD_TO_INR_RATE).toFixed(0)}`
                          : String(part[header])
                        }
                      </td>
                    ))}
                    <td>
                      <button onClick={() => onPartSelect(part)}>
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
           {!loading && parts.length === 0 && (
            <p>No parts found{isSearching ? ' that match your criteria.' : '.'}</p>
           )}
        </div>
        
        {/* Pagination (Only show if not searching AND not filtering) */}
        {!isSearching && !compatibleOnly && (
            <div className="modal-footer">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                &laquo; Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                Next &raquo;
            </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default PartChooser;
