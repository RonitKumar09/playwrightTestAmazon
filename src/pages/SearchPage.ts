import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SearchResult } from '../types';

// Amazon search page implementation
export class SearchPage extends BasePage {
  private searchBox = this.page.locator('#twotabsearchtextbox');
  private searchButton = this.page.locator('#nav-search-submit-button');
  private productTitles = this.page.locator('[data-component-type="s-search-result"] h2 a span');
  private productPrices = this.page.locator('[data-component-type="s-search-result"] .a-price-whole');
  private productLinks = this.page.locator('[data-component-type="s-search-result"] h2 a');

  constructor(page: Page) {
    super(page);
  }

  async searchProduct(productName: string): Promise<void> {
    await this.fillInput(this.searchBox, productName);
    await this.clickElement(this.searchButton);
    await this.waitForPageLoad();
  }

  async verifySearchKeyword(expectedKeyword: string): Promise<boolean> {
    const resultText = await this.page.textContent('body');
    return resultText?.toLowerCase().includes(expectedKeyword.toLowerCase()) || false;
  }

  async getSearchResults(limit: number = 10): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const titles = await this.productTitles.all();
    const prices = await this.productPrices.all();
    const links = await this.productLinks.all();

    const maxItems = Math.min(limit, titles.length, prices.length);

    for (let i = 0; i < maxItems; i++) {
      const name = await this.getText(titles[i]);
      const priceText = await this.getText(prices[i]);
      const price = this.parsePrice(priceText);
      const link = await links[i].getAttribute('href') || '';

      if (name && price > 0) {
        results.push({ name, price, link });
      }
    }

    return results;
  }

  private parsePrice(priceText: string): number {
    return parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
  }
}