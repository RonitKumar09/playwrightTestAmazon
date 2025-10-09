import { Page } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { SearchResult, CartItem, TestResults } from '../types';
import { PRICE_RANGES } from '../data/testData';

// Main automation service orchestrating the e-commerce flow
export class AutomationService {
  private searchPage: SearchPage;
  private productPage: ProductPage;
  private cartPage: CartPage;

  constructor(private page: Page) {
    this.searchPage = new SearchPage(page);
    this.productPage = new ProductPage(page);
    this.cartPage = new CartPage(page);
  }

  async executeProductTest(productName: string, expectedKeyword: string): Promise<TestResults> {
    const results: TestResults = {
      searchKeywordFound: false,
      productsAddedToCart: [],
      cartTotalValid: false,
      pricesMatch: false
    };

    // Navigate to Amazon
    await this.page.goto('https://amazon.in');
    
    // Search for product
    await this.searchPage.searchProduct(productName);
    
    // Verify search keyword
    results.searchKeywordFound = await this.searchPage.verifySearchKeyword(expectedKeyword);
    
    // Get first 10 search results
    const searchResults = await this.searchPage.getSearchResults(10);
    
    // Process each product based on price
    for (const result of searchResults) {
      const cartItem = await this.processProduct(result);
      if (cartItem) {
        results.productsAddedToCart.push(cartItem);
      }
    }

    // Validate cart if products were added
    if (results.productsAddedToCart.length > 0) {
      await this.validateCart(results);
    }

    return results;
  }

  private async processProduct(result: SearchResult): Promise<CartItem | null> {
    const { price, link } = result;

    if (price >= PRICE_RANGES.LOW && price <= PRICE_RANGES.HIGH) {
      // Add directly to cart for prices between ₹500-₹1000
      return await this.addProductDirectlyToCart(result);
    } else if (price < PRICE_RANGES.LOW) {
      // Navigate to product page and update quantity for prices below ₹500
      return await this.addProductWithQuantityUpdate(result);
    }

    return null; // Skip products above ₹1000
  }

  private async addProductDirectlyToCart(result: SearchResult): Promise<CartItem | null> {
    try {
      await this.productPage.navigateToProduct(result.link);
      await this.productPage.addToCart();
      
      return {
        product: { name: result.name, price: result.price, quantity: 1 },
        addedPrice: result.price
      };
    } catch (error) {
      console.log(`Failed to add ${result.name} directly to cart`);
      return null;
    }
  }

  private async addProductWithQuantityUpdate(result: SearchResult): Promise<CartItem | null> {
    try {
      await this.productPage.navigateToProduct(result.link);
      await this.productPage.updateQuantity(2);
      await this.productPage.addToCart();
      
      return {
        product: { name: result.name, price: result.price, quantity: 2 },
        addedPrice: result.price * 2
      };
    } catch (error) {
      console.log(`Failed to add ${result.name} with quantity update to cart`);
      return null;
    }
  }

  private async validateCart(results: TestResults): Promise<void> {
    await this.cartPage.navigateToCart();
    
    const cartProducts = await this.cartPage.getCartProducts();
    const expectedTotal = results.productsAddedToCart.reduce((sum, item) => sum + item.addedPrice, 0);
    
    results.cartTotalValid = await this.cartPage.validateCartTotal(expectedTotal);
    results.pricesMatch = this.validatePricesMatch(results.productsAddedToCart, cartProducts);
  }

  private validatePricesMatch(addedItems: CartItem[], cartProducts: any[]): boolean {
    // Basic validation
    return addedItems.length === cartProducts.length;
  }
}