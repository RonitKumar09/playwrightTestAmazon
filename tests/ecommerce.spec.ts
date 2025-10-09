import { test, expect } from '@playwright/test';
import { AutomationService } from '../src/utils/AutomationService';
import { TEST_PRODUCTS } from '../src/data/testData';
import { TestResults } from '../src/types';

// Main e-commerce automation test suite
test.describe('Amazon E-commerce Automation', () => {
  
  test('Product search and cart validation flow', async ({ page }) => {
    const automationService = new AutomationService(page);
    const allResults: TestResults[] = [];

    // Execute test for each product
    for (const testProduct of TEST_PRODUCTS) {
      console.log(`Testing product: ${testProduct.name}`);
      
      const results = await automationService.executeProductTest(
        testProduct.name, 
        testProduct.expectedKeyword
      );
      
      allResults.push(results);
      
      // Validate search keyword found
      expect(results.searchKeywordFound).toBeTruthy();
      
      // Log results for verification
      console.log(`Products added to cart: ${results.productsAddedToCart.length}`);
      console.log(`Cart total valid: ${results.cartTotalValid}`);
      console.log(`Prices match: ${results.pricesMatch}`);
    }

    // Final validations across all products
    const totalProductsAdded = allResults.reduce((sum, result) => 
      sum + result.productsAddedToCart.length, 0
    );
    
    console.log(`Total products added across all searches: ${totalProductsAdded}`);
    expect(totalProductsAdded).toBeGreaterThan(0);
  });

  test('Individual product validation', async ({ page }) => {
    const automationService = new AutomationService(page);
    
    // Test single product for detailed validation
    const singleProduct = TEST_PRODUCTS[0];
    const results = await automationService.executeProductTest(
      singleProduct.name,
      singleProduct.expectedKeyword
    );

    // Detailed assertions
    expect(results.searchKeywordFound).toBeTruthy();
    
    if (results.productsAddedToCart.length > 0) {
      expect(results.cartTotalValid).toBeTruthy();
      expect(results.pricesMatch).toBeTruthy();
    }
  });
});