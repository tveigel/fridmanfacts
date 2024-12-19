// lib/utils/colors.js
export const STATUS_COLORS = {
    VALIDATED_FALSE: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      raw: '#FF3B30'
    },
    VALIDATED_CONTROVERSIAL: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      raw: '#FFCC00'
    },
    VALIDATED_TRUE: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      raw: '#34C759'
    },
    UNVALIDATED: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      raw: '#8E8E93'
    }
  };
  
  export const getStatusColors = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.UNVALIDATED;
  };