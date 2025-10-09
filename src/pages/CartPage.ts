import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Product } from '../types';

// Amazon cart page implementation
export class CartPage extends BasePage {
  private cartItems = this.page.locator('[data-name="Active Items"] .sc-list-item');
  private cartItemNames = this.page.locator('[data-name="Active Items"] .sc-product-title');
  private cartItemPrices = this.page.locator('[data-name="Active Items"] .sc-price');
  private cartTotal = this.page.locator('#sc-subtotal-amount-buybox .a-price-whole');

  constructor(page: Page) {
    super(page);
  }

  async navigateToCart(): Promise<void> {
    await this.page.goto('https://amazon.in/gp/cart/view.html');
    await this.waitForPageLoad();
  }

  async getCartProducts(): Promise<Product[]> {
    const products: Product[] = [];
    const names = await this.cartItemNames.all();
    const prices = await this.cartItemPrices.all();

    for (let i = 0; i < names.length; i++) {
      const name = await this.getText(names[i]);
      const priceText = await this.getText(prices[i]);
      const price = this.parsePrice(priceText);

      if (name && price > 0) {
        products.push({ name, price, quantity: 1 });
      }
    }

    return products;
  }

  async getCartTotal(): Promise<number> {
    const totalText = await this.getText(this.cartTotal);
    return this.parsePrice(totalText);
  }

  async validateCartTotal(expectedTotal: number): Promise<boolean> {
    const actualTotal = await this.getCartTotal();
    return Math.abs(actualTotal - expectedTotal) < 1; // Allow small rounding differences
  }

  private parsePrice(priceText: string): number {
    return parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
  }
}