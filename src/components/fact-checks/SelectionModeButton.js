"use client";

import React from 'react';
import { useProtectedAction } from '../../hooks/useProtectedAction';
import FlagIcon from './FlagIcon';

const SelectionModeButton = ({ isActive, onClick }) => {
  const { withAuth } = useProtectedAction();

  return (
    <button
      onClick={withAuth(onClick)}
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition-colors ${
        isActive 
          ? 'bg-black text-white' 
          : 'bg-white text-black border border-black'
      }`}
    >
      <FlagIcon status={isActive ? 'VALIDATED_TRUE' : 'default'} className="mt-0.5" />
      <span>{isActive ? 'Exit Fact-Check Mode' : 'Enter Fact-Check Mode'}</span>
    </button>
  );
};

export default SelectionModeButton;