// VoteFilter.js
import React, { useState, useMemo } from 'react';
import { useFactCheckSettings } from '../../lib/context/FactCheckSettingsContext';
import { useAuth } from '../../lib/context/AuthContext';
import { ChevronDown, ChevronUp, Info, Save, RotateCcw } from 'lucide-react';
import Modal from '../common/Modal';
import Login from '../auth/Login';

const VoteFilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md transition-all ${
      active
        ? 'bg-black text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

const VoteFilter = ({ factChecks }) => {
  const { user } = useAuth();
  const { 
    settings, 
    updateSingleSetting, 
    saveAsDefault, 
    resetToDefaults,
    userDefaults 
  } = useFactCheckSettings();
  
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState(settings.minNetVotes.toString());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Calculate vote statistics
  const voteStats = useMemo(() => {
    const stats = factChecks.reduce((acc, check) => {
      const netVotes = (check.upvotes || 0) - (check.downvotes || 0);
      if (netVotes > acc.max) acc.max = netVotes;
      if (netVotes < acc.min) acc.min = netVotes;
      acc.counts[netVotes] = (acc.counts[netVotes] || 0) + 1;
      return acc;
    }, { min: 0, max: 0, counts: {} });

    // Calculate thresholds based on data distribution
    const total = factChecks.length;
    let cumulative = 0;
    const thresholds = [];
    
    Object.entries(stats.counts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([votes, count]) => {
        cumulative += count;
        const percentage = (cumulative / total) * 100;
        
        if (percentage >= 25 && percentage <= 75) {
          thresholds.push(Number(votes));
        }
      });

    return {
      min: stats.min,
      max: stats.max,
      suggested: thresholds[Math.floor(thresholds.length / 2)] || 0
    };
  }, [factChecks]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const value = parseInt(customValue);
    if (!isNaN(value)) {
      updateSingleSetting('minNetVotes', value);
    }
  };

  const handleSaveAsDefault = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const success = await saveAsDefault();
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving default settings:', error);
    }
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const quickFilters = [
    { label: 'All', value: -999 },
    { label: 'Positive', value: 1 },
    { label: 'Highly Rated', value: voteStats.suggested },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Net Vote Filter</span>
          <button
            className="text-gray-400 hover:text-gray-600"
            title="Filter fact checks based on the difference between upvotes and downvotes"
          >
            <Info size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {userDefaults && (
            <button
              onClick={handleResetToDefaults}
              title="Reset to your saved defaults"
              className="p-2 text-gray-600 hover:text-gray-900 rounded-md"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            onClick={handleSaveAsDefault}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <Save size={16} />
            <span>Save as Default</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
          Settings saved as default successfully!
        </div>
      )}

      {resetSuccess && (
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
          Settings reset to defaults successfully!
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {quickFilters.map(({ label, value }) => (
          <VoteFilterButton
            key={label}
            active={settings.minNetVotes === value}
            onClick={() => updateSingleSetting('minNetVotes', value)}
          >
            {label}
          </VoteFilterButton>
        ))}
        
        <VoteFilterButton
          active={showCustom}
          onClick={() => setShowCustom(!showCustom)}
        >
          Custom
          {showCustom ? (
            <ChevronUp className="inline ml-1 w-4 h-4" />
          ) : (
            <ChevronDown className="inline ml-1 w-4 h-4" />
          )}
        </VoteFilterButton>
      </div>

      {showCustom && (
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 mt-2">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-24 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Value"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Apply
          </button>
        </form>
      )}

      <div className="text-sm text-gray-500 mt-1">
        Showing fact checks with net votes ≥ {settings.minNetVotes === -999 ? 'all' : settings.minNetVotes}
      </div>

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Login Required</h2>
          <p className="mb-4">Please login to save your default settings.</p>
          <Login />
        </div>
      </Modal>
    </div>
  );
};

export default VoteFilter;