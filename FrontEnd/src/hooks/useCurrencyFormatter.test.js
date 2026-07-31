import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useCurrencyFormatter from './useCurrencyFormatter';

// Mock the zustand store
vi.mock('../store/useAppStore', () => ({
  default: () => ({
    currency: 'USD',
    exchangeRates: { INR: 83.0, EUR: 0.92, USD: 1 }
  })
}));

describe('useCurrencyFormatter', () => {
  it('should format amount in USD correctly', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    // Test base conversion (100 INR to USD = ~1.20)
    const formatted = result.current.formatAmount(100);
    expect(formatted).toMatch(/\$1\.2/);
  });

  it('should correctly format 0 amount', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    const formatted = result.current.formatAmount(0);
    expect(formatted).toMatch(/\$0/);
  });
});
