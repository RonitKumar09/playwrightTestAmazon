import { TestProduct } from '../types';

// Test data for product search validation
export const TEST_PRODUCTS: TestProduct[] = [
  { name: 'wireless mouse', expectedKeyword: 'wireless mouse' },
  { name: 'Bluetooth headset', expectedKeyword: 'Bluetooth headset' },
  { name: 'Data cable', expectedKeyword: 'Data cable' },
  { name: 'Pen drive', expectedKeyword: 'Pen drive' },
  { name: 'laptop stand', expectedKeyword: 'laptop stand' }
];

export const PRICE_RANGES = {
  LOW: 500,
  HIGH: 1000
} as const;