// Core types for product search and cart operations
export interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
}

export interface SearchResult {
  name: string;
  price: number;
  link: string;
}

export interface TestProduct {
  name: string;
  expectedKeyword: string;
}

export interface CartItem {
  product: Product;
  addedPrice: number;
}

export interface TestResults {
  searchKeywordFound: boolean;
  productsAddedToCart: CartItem[];
  cartTotalValid: boolean;
  pricesMatch: boolean;
}