// components/fact-checks/FlagIcon.js
import React from 'react';
import { getStatusColors } from '../../lib/utils/colors';

const FlagIcon = ({ status = 'UNVALIDATED', className = '', size = 32 }) => {
  const { raw: color } = getStatusColors(status);

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={`transition-all duration-200 ${className}`}
      style={{ 
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      }}
    >
      <path
        d="M4 21V4C4 3.45 4.196 2.979 4.588 2.587C4.98 2.195 5.45067 1.99934 6 2H18.4C18.7167 2 18.975 2.1 19.175 2.3C19.375 2.5 19.475 2.75 19.475 3.05C19.475 3.35 19.3917 3.60434 19.225 3.813L16.825 7L19.225 10.188C19.3917 10.396 19.475 10.65 19.475 10.95C19.475 11.25 19.375 11.5 19.175 11.7C18.975 11.9 18.7167 12 18.4 12H6V21C6 21.2833 5.904 21.521 5.712 21.713C5.52 21.905 5.28267 22.0007 5 22C4.71667 22 4.479 21.904 4.287 21.712C4.095 21.52 3.99934 21.2827 4 21Z"
        fill={color}
      />
    </svg>
  );
};

export default React.memo(FlagIcon);