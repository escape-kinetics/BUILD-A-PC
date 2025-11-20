import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../apiService';
import PartChooser from '../components/PartChooser';
import './BuilderPage.css';

const USD_TO_INR_RATE = 88.7;

// Helper function
const getLogoByManufacturer = (manufacturer) => {
  if (!manufacturer) return '';
  const m = manufacturer.toLowerCase();

  // Check for brands
  if (m.includes('intel')) return 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel_logo_%282020%2C_dark_blue%29.svg';
  if (m.includes('amd')) return 'https://upload.wikimedia.org/wikipedia/commons/0/0e/AMD_logo.svg';
  if (m.includes('nvidia')) return 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg';
  if (m.includes('asus')) return 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Asus_logo.svg';
  if (m.includes('gigabyte')) return 'https://upload.wikimedia.org/wikipedia/commons/7/71/Gigabyte_logo.svg';
  if (m.includes('msi')) return 'https://upload.wikimedia.org/wikipedia/commons/9/90/MSI_logo.svg';
  if (m.includes('asrock')) return 'https://upload.wikimedia.org/wikipedia/commons/3/30/ASRock_logo.svg';
  if (m.includes('corsair')) return 'https://upload.wikimedia.org/wikipedia/commons/4/48/Corsair_logo.svg';
  if (m.includes('kingston')) return 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Kingston_Technology_logo.svg';
  if (m.includes('samsung')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Samsung_Logo.svg';
  if (m.includes('cooler master')) return 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Cooler_Master_logo.svg';
  if (m.includes('lian li')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Lian_Li_logo.svg';
  if (m.includes('seagate')) return 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Seagate_logo.svg';
  if (m.includes('western digital')) return 'https://upload.wikimedia.org/wikipedia/commons/9/93/Western_Digital_logo.svg';
  if (m.includes('lg')) return 'https://upload.wikimedia.org/wikipedia/commons/f/f2/LG_logo_%282015%29.svg';
  if (m.includes('dell')) return 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg';
  
  // Default: no logo
  return '';
};


// This constant maps the check key to its UI label
const COMPAT_MAP = {
  cpu_mb: 'CPU ↔ Motherboard',
  mb_case: 'Motherboard ↔ Case',
  gpu_psu: 'GPU ↔ PSU Power',
};

// The part categories your backend supports
const PART_CATEGORIES = [
  { key: 'cpu', name: 'CPU', db_id: 'cpu_id', table: 'cpus' },
  { key: 'motherboard', name: 'Motherboard', db_id: 'motherboard_id', table: 'motherboards' },
  { key: 'ram', name: 'Memory', db_id: 'ram_id', table: 'ram' },
  { key: 'gpu', name: 'GPU', db_id: 'gpu_id', table: 'gpus' },
  { key: 'case', name: 'Case', db_id: 'case_id', table: 'cases' },
  { key: 'psu', name: 'Power Supply', db_id: 'psu_id', table: 'psus' },
  { key: 'ssd', name: 'Storage (SSD)', db_id: 'ssd_id', table: 'ssds' },
  { key: 'display', name: 'Monitor', db_id: 'display_id', table: 'displays' },
];

function BuilderPage() {
  const [buildName, setBuildName] = useState('');
  const [selectedParts, setSelectedParts] = useState({});
  const [choosingCategory, setChoosingCategory] = useState(null);
  
  const { build_id } = useParams(); 
  const navigate = useNavigate();
  const isEditing = Boolean(build_id);

  const [totalTDP, setTotalTDP] = useState(0);
  const [compatibility, setCompatibility] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // === EFFECT FOR COMPATIBILITY (CHECKS ALL PAIRS) ===
  useEffect(() => {
    const checkCompat = async () => {
      let newCompat = {}; // Start fresh to remove stale checks
      
      // 1. Check CPU <-> Motherboard
      if (selectedParts.cpu && selectedParts.motherboard) {
        try {
          const res = await apiService.checkCompatibility('cpu', selectedParts.cpu.id, 'motherboard', selectedParts.motherboard.id);
          newCompat.cpu_mb = res.data.compatibility;
        } catch (e) { newCompat.cpu_mb = e.response?.data?.detail || 'Check failed'; }
      }
      
      // 2. Check Motherboard <-> Case
      if (selectedParts.motherboard && selectedParts.case) {
         try {
          const res = await apiService.checkCompatibility('motherboard', selectedParts.motherboard.id, 'case', selectedParts.case.id);
          newCompat.mb_case = res.data.compatibility;
        } catch (e) { newCompat.mb_case = e.response?.data?.detail || 'Check failed'; }
      }
      
      // 3. Check GPU <-> PSU (Power Check)
      if (selectedParts.gpu && selectedParts.psu) {
         try {
          const res = await apiService.checkCompatibility('gpu', selectedParts.gpu.id, 'psu', selectedParts.psu.id);
          newCompat.gpu_psu = res.data.compatibility;
        } catch (e) { newCompat.gpu_psu = e.response?.data?.detail || 'Check failed'; }
      }
      
      setCompatibility(newCompat);
    };

    checkCompat();
  }, [selectedParts]); // Re-run whenever parts change

  // === EFFECT FOR REAL-TIME TDP (UPDATED) ===
  useEffect(() => {
    let currentTDP = 0;
    
    // Helper function to find a power value from a part
    const findPower = (part, possibleKeys) => {
        if (!part) return 0;
        for (const key of possibleKeys) {
            if (part[key] && !isNaN(Number(part[key]))) {
                return Number(part[key]);
            }
        }
        return 0;
    }

    // 1. Get CPU Power (tdp is the standard column)
    const cpuKeys = ['tdp', 'power', 'max_power'];
    const cpuTdpValue = findPower(selectedParts.cpu, cpuKeys);
    currentTDP += cpuTdpValue;
    
    // 2. Get GPU Power (tdp_w is the correct column in your DB)
    const gpuKeys = ['tdp_w', 'power_draw', 'tdp', 'power'];
    const gpuTdpValue = findPower(selectedParts.gpu, gpuKeys);
    currentTDP += gpuTdpValue;

    setTotalTDP(currentTDP);
  }, [selectedParts]); // Re-run whenever parts change

  // === EFFECT FOR PSU vs. TDP - REMOVED (using GPU-PSU compatibility check instead) ===
  // The compatibility check handles PSU wattage vs GPU power requirements

  // === EFFECT FOR LOADING EXISTING BUILD ===
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      apiService.fetchSinglePart('builds', build_id)
        .then(async (res) => {
          const build = res.data.item;
          setBuildName(build.build_name);
          let newSelectedParts = {};
          const partFetchPromises = [];
          const idToKeyMap = PART_CATEGORIES.reduce((acc, cat) => {
            acc[cat.db_id] = cat;
            return acc;
          }, {});
          for (const db_id in idToKeyMap) {
            const partId = build[db_id];
            if (partId) {
              const category = idToKeyMap[db_id];
              partFetchPromises.push(
                apiService.fetchSinglePart(category.table, partId)
                  .then(partRes => {
                    newSelectedParts[category.key] = partRes.data.item;
                  })
                  .catch(err => console.error(`Failed to fetch ${category.key}`, err))
              );
            }
          }
          await Promise.all(partFetchPromises);
          setSelectedParts(newSelectedParts);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to load build", err);
          alert("Could not load build.");
          navigate('/builder');
        });
    }
  }, [build_id, isEditing, navigate]);


  const handleChoosePart = (category) => {
    setChoosingCategory(category);
  };

  const handlePartSelected = (part) => {
    const categoryKey = choosingCategory.key;
    setSelectedParts(prevParts => ({
      ...prevParts,
      [categoryKey]: part,
    }));
    setChoosingCategory(null);
  };

  const handleRemovePart = (categoryKey) => {
    setSelectedParts(prevParts => {
      const newParts = { ...prevParts };
      delete newParts[categoryKey];
      return newParts;
    });
  };
  
  const handleCalculatePowerOnSave = (currentBuildId) => {
      return apiService.estimatePower(currentBuildId)
        .then(res => res.data.total_power_estimate)
        .catch(err => {
            console.error("Failed to calculate power", err);
            // Don't alert here, just fail gracefully
        })
  }

  // === UPDATED SAVE FUNCTION ===
  const handleSaveBuild = () => {
    if (!buildName) {
      alert("Please enter a name for your build.");
      return;
    }

    // Check for compatibility errors before saving
    const compatMessages = Object.values(compatibility);
    let firstError = null;
    
    for (const msg of compatMessages) {
        if (msg && (msg.toLowerCase().includes('incompatible') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('requires'))) {
            firstError = msg;
            break; // Found the first error, stop looking
        }
    }

    if (firstError) {
        // Alert the exact error and stop the save
        alert(`Error: ${firstError}`);
        return; 
    }

    // If no errors, proceed with saving
    const buildData = { build_name: buildName };
    PART_CATEGORIES.forEach(cat => {
      buildData[cat.db_id] = selectedParts[cat.key] ? selectedParts[cat.key].id : null;
    });

    const saveOperation = isEditing 
      ? apiService.updateBuild(build_id, buildData).then(res => build_id)
      : apiService.createBuild(buildData).then(res => res.data.build_id);

    saveOperation
      .then(savedBuildId => {
          // After save, run the *database* power calculation
          return handleCalculatePowerOnSave(savedBuildId);
      })
      .then(() => {
          alert(`Build ${isEditing ? 'updated' : 'saved'} successfully!`);
          navigate('/builds');
      })
      .catch(err => {
          console.error(`Failed to ${isEditing ? 'update' : 'save'} build`, err);
          // ▼▼▼ THIS IS THE FIX FOR YOUR ALERT ▼▼▼
          // Show the *real* error from the database trigger
          alert(`Error: ${err.response?.data?.detail || 'An unknown error occurred.'}`);
      });
  };
  
  const renderTDPIndicator = () => {
    const psu = selectedParts.psu;
    if (!psu || !psu.watt) {
        return <span className="tdp-indicator tdp-neutral">Select a PSU</span>;
    }
    
    // Don't show an indicator if TDP is 0
    if (totalTDP === 0) {
        return <span className="tdp-indicator tdp-neutral">{psu.watt}W</span>;
    }

    const recommendedWattage = totalTDP * 1.2;
    if (psu.watt < totalTDP) {
      return <span className="tdp-indicator tdp-bad">INSUFFICIENT</span>;
    }
    if (psu.watt < recommendedWattage) {
      return <span className="tdp-indicator tdp-warning">LOW HEADROOM</span>;
    }
    return <span className="tdp-indicator tdp-good">GOOD</span>;
  };
  
  // === UPDATED RENDER FUNCTION ===
  const renderIncompatibilityList = () => {
    const allChecks = Object.keys(COMPAT_MAP).map(key => {
        return {
            key: key,
            label: COMPAT_MAP[key],
            message: compatibility[key]
        };
    }).filter(check => check.message); // Only show checks that have a message

    if (allChecks.length === 0) {
      return (
        <div className="compat-list info">
          <h4>Compatibility Report</h4>
          <p>Select components (like a CPU and Motherboard) to check compatibility.</p>
        </div>
      );
    }
    
    return (
        <div className="compat-list">
            <h4>Compatibility Report</h4>
            <ul>
                {allChecks.map((check) => {
                    const isError = check.message.toLowerCase().includes('incompatible') || check.message.toLowerCase().includes('invalid') || check.message.toLowerCase().includes('requires');
                    
                    const displayMessage = check.message;
                    
                    const itemClass = isError ? 'compat-item-error' : 'compat-item-success';
                    
                    return (
                        <li key={check.key} className={itemClass}>
                            <strong>{check.label}:</strong> {displayMessage}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
  };
  
  // === UPDATED RENDER FUNCTION ===
  const renderPartRow = (category) => {
    const part = selectedParts[category.key];
    const logoUrl = part && part.manufacturer ? getLogoByManufacturer(part.manufacturer) : '';
    
    return (
      <tr key={category.key} className={part ? 'part-row-selected' : ''}>
        <th>{category.name}</th>
        <td>
          <div className="part-info-cell">
            {logoUrl && (
              <img src={logoUrl} alt={part.manufacturer} className="part-logo" onError={(e) => e.target.style.display = 'none'} />
            )}
            <div>
              {part ? (
                <>
                  <div className="part-name">{part.name}</div>
                  <div className="part-desc">{part.manufacturer}</div>
                </>
              ) : (
                <em>No part selected</em>
              )}
            </div>
          </div>
        </td>
        <td className="part-price">
          {part ? `₹${(part.price * USD_TO_INR_RATE).toFixed(0)}` : ''}
        </td>
        <td>
          <div className="action-buttons">
            <button className="choose-button" onClick={() => handleChoosePart(category)}>
              {part ? 'Change' : 'Choose'}
            </button>
            {part && (
              <button className="remove-button" onClick={() => handleRemovePart(category.key)}>
                Remove
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (isLoading) return <h2>Loading Build...</h2>;

  return (
    <div className="builder-page">
      <h2>{isEditing ? 'Edit Your Build' : 'Create Your Build'}</h2>
      
      {choosingCategory && (
        <PartChooser
          category={choosingCategory.table}
          onPartSelect={handlePartSelected}
          onCancel={() => setChoosingCategory(null)}
          currentBuild={selectedParts}
        />
      )}
      
      <div className="save-build-bar">
        <input
          type="text"
          placeholder="Enter Build Name..."
          value={buildName}
          onChange={(e) => setBuildName(e.target.value)}
        />
        <button onClick={handleSaveBuild}>
          {isEditing ? 'Update Build' : 'Save Build'}
        </button>
      </div>
      
      <table className="part-table">
        <tbody>
          {PART_CATEGORIES.map(cat => renderPartRow(cat))}
        </tbody>
        
        <tfoot>
            <tr className="total-tdp-row">
                <th>Total Power Estimate</th>
                <td colSpan="3">
                    <div className="tdp-container">
                        <strong>{totalTDP} Watts</strong>
                        {renderTDPIndicator()}
                    </div>
                </td>
            </tr>
        </tfoot>
      </table>
      
      <div className="incompatibility-section">
        {renderIncompatibilityList()}
      </div>
    </div>
  );
}

export default BuilderPage;
