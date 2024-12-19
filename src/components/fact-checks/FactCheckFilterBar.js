import React from 'react';
import { useFactCheckSettings } from '../../lib/context/FactCheckSettingsContext';
import FlagIcon from '../fact-checks/FlagIcon';
import VoteFilter from './VoteFilter';

const FilterButton = ({ status, label, checked, onChange }) => (
  <button
    onClick={onChange}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
      ${checked 
        ? 'bg-black text-white shadow-md transform scale-105' 
        : 'bg-white text-gray-700 hover:bg-gray-50'}`}
  >
    <FlagIcon status={status} size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const FactCheckFilterBar = ({ factChecks = [] }) => {
  const { settings, updateSingleSetting } = useFactCheckSettings();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-start gap-8">
        {/* Status Filters */}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700 mb-3">Status Filter</div>
          <div className="flex flex-wrap gap-3">
            <FilterButton
              status="VALIDATED_TRUE"
              label="Valid"
              checked={settings.showValidatedTrue}
              onChange={() => updateSingleSetting('showValidatedTrue', !settings.showValidatedTrue)}
            />
            <FilterButton
              status="VALIDATED_FALSE"
              label="False"
              checked={settings.showValidatedFalse}
              onChange={() => updateSingleSetting('showValidatedFalse', !settings.showValidatedFalse)}
            />
            <FilterButton
              status="VALIDATED_CONTROVERSIAL"
              label="Disputed"
              checked={settings.showValidatedControversial}
              onChange={() => updateSingleSetting('showValidatedControversial', !settings.showValidatedControversial)}
            />
            <FilterButton
              status="UNVALIDATED"
              label="Unvalidated"
              checked={settings.showUnvalidated}
              onChange={() => updateSingleSetting('showUnvalidated', !settings.showUnvalidated)}
            />
          </div>
        </div>

        {/* Vote Filter */}
        <div className="min-w-[300px]">
          <VoteFilter factChecks={factChecks} />
        </div>
      </div>
    </div>
  );
};

export default FactCheckFilterBar;