/**
 * Format number to currency string
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use (default: 'vi-VN')
 * @param {string} currency - The currency code (default: 'VND')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, locale = "vi-VN", currency = "VND") => {
  if (amount === null || amount === undefined) {
    return "0 ₫";
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return "0 ₫";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  } catch (error) {
    // Fallback formatting if Intl fails
    return `${numAmount.toLocaleString("vi-VN")} ₫`;
  }
};

/**
 * Format number to compact currency string (e.g., 1.5M, 2.3K)
 * @param {number} amount - The amount to format
 * @returns {string} Compact formatted currency string
 */
export const formatCompactCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return "0 ₫";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0 ₫";
  }

  if (numAmount >= 1000000000) {
    return `${(numAmount / 1000000000).toFixed(1)}B ₫`;
  }
  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M ₫`;
  }
  if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(1)}K ₫`;
  }

  return `${numAmount.toLocaleString("vi-VN")} ₫`;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;

  // Remove all non-numeric characters except decimal point
  const numericString = currencyString.replace(/[^\d.-]/g, "");
  const amount = parseFloat(numericString);

  return isNaN(amount) ? 0 : amount;
};
