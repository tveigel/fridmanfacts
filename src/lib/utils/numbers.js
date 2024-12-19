// src/lib/utils/numbers.js

/**
 * Formats a number with K/M/B suffixes
 * @param {number} num - The number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    
    const absNum = Math.abs(num);
    if (absNum >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (absNum >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (absNum >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };
  
  /**
   * Formats a number with commas for thousands
   * @param {number} num - The number to format
   * @returns {string} - Formatted number with commas
   */
  export const formatNumberWithCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };