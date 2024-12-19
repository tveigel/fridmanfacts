import React from 'react';
import FlagIcon from './FlagIcon';

const SelectionPopup = ({ top, left, onFactCheck }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999
      }}
      className="bg-black text-white px-4 py-2 rounded-lg shadow-lg 
                 flex items-center gap-2 hover:bg-gray-800 
                 transition-all duration-200 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onFactCheck();
      }}
    >
      <FlagIcon status="VALIDATED_TRUE" size={20} />
      <span className="text-base font-medium whitespace-nowrap">Fact Check</span>
    </div>
  );
};

export default SelectionPopup;