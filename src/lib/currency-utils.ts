
'use client';

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
};

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return '$'; // Default to USD if no code
  return currencySymbols[currencyCode.toUpperCase()] || currencyCode; // Fallback to code itself if symbol not found
}
