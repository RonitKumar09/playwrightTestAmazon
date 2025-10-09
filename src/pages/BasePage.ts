import { Page, Locator } from '@playwright/test';

// Base page class with common functionality
export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected async clickElement(locator: Locator): Promise<void> {
    await locator.click();
  }

  protected async fillInput(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  protected async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }
}