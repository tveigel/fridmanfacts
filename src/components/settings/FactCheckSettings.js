// src/components/settings/FactCheckSettings.js
import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import FlagIcon from '../fact-checks/FlagIcon';
import { useFactCheckSettings } from '../../lib/context/FactCheckSettingsContext';

export const SettingsMenu = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings, DEFAULT_SETTINGS } = useFactCheckSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Handle local setting changes
  const handleStatusToggle = (key) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVoteThresholdChange = (value) => {
    setLocalSettings(prev => ({
      ...prev,
      minNetVotes: parseInt(value)
    }));
  };

  const handleModeratorOnlyToggle = () => {
    setLocalSettings(prev => ({
      ...prev,
      moderatorOnly: !prev.moderatorOnly
    }));
  };

  // Apply settings
  const handleApply = () => {
    updateSettings(localSettings);
    onClose();
  };

  // Reset settings
  const handleReset = () => {
    const defaultSettings = { ...DEFAULT_SETTINGS };
    setLocalSettings(defaultSettings);
    updateSettings(defaultSettings);
  };

  const StatusToggle = ({ status, label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-black rounded focus:ring-black"
      />
      <div className="flex items-center gap-2">
        <FlagIcon status={status} size={20} />
        <span className="text-gray-900">{label}</span>
      </div>
    </label>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Fact Check Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Status Filters */}
            <div>
              <h3 className="font-medium mb-4 text-gray-900">Show Facts by Status</h3>
              <div className="space-y-3">
                <StatusToggle
                  status="VALIDATED_TRUE"
                  label="Validated True"
                  checked={localSettings.showValidatedTrue}
                  onChange={() => handleStatusToggle('showValidatedTrue')}
                />
                <StatusToggle
                  status="VALIDATED_FALSE"
                  label="Validated False"
                  checked={localSettings.showValidatedFalse}
                  onChange={() => handleStatusToggle('showValidatedFalse')}
                />
                <StatusToggle
                  status="VALIDATED_CONTROVERSIAL"
                  label="Controversial"
                  checked={localSettings.showValidatedControversial}
                  onChange={() => handleStatusToggle('showValidatedControversial')}
                />
                <StatusToggle
                  status="UNVALIDATED"
                  label="Unvalidated"
                  checked={localSettings.showUnvalidated}
                  onChange={() => handleStatusToggle('showUnvalidated')}
                />
              </div>
            </div>

            {/* Net Votes Threshold */}
            <div>
              <h3 className="font-medium mb-2 text-gray-900">Minimum Net Votes</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Show fact checks with more than {localSettings.minNetVotes} net votes
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="1"
                value={localSettings.minNetVotes}
                onChange={(e) => handleVoteThresholdChange(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>-5</span>
                <span>{localSettings.minNetVotes}</span>
                <span>5</span>
              </div>
            </div>

            {/* Moderator Only Toggle */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.moderatorOnly}
                  onChange={handleModeratorOnlyToggle}
                  className="w-4 h-4 text-black rounded focus:ring-black"
                />
                <span className="text-gray-900">Show only moderator-validated facts</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Reset to Defaults
              </button>
              <div className="space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FactCheckSettings = {
  SettingsMenu,
};

export default FactCheckSettings;