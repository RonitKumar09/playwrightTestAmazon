import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

// Amazon product detail page implementation
export class ProductPage extends BasePage {
  private quantityDropdown = this.page.locator('#quantity');
  private addToCartButton = this.page.locator('#add-to-cart-button');
  private priceElement = this.page.locator('.a-price-whole').first();

  constructor(page: Page) {
    super(page);
  }

  async updateQuantity(quantity: number): Promise<void> {
    await this.clickElement(this.quantityDropdown);
    await this.page.selectOption('#quantity', { value: quantity.toString() });
  }

  async addToCart(): Promise<void> {
    await this.clickElement(this.addToCartButton);
    await this.page.waitForTimeout(2000); // Wait for cart update
  }

  async getProductPrice(): Promise<number> {
    const priceText = await this.getText(this.priceElement);
    return parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
  }

  async navigateToProduct(productLink: string): Promise<void> {
    const fullUrl = productLink.startsWith('http') ? productLink : `https://amazon.in${productLink}`;
    await this.navigateTo(fullUrl);
    await this.waitForPageLoad();
  }
}