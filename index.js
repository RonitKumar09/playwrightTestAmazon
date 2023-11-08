// @ts-check
const testData = require("./testInput.json");
const exportToExcel = require("./exportToCsv");
const { expect, chromium, firefox, webkit } = require("@playwright/test");

const PAGE_TITLE =
  "Online Shopping site in India: Shop Online for Mobiles, Books, Watches, Shoes and More - Amazon.in";
const PLACE_HOLDER = "Search Amazon.in";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" +
  " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";

async function doTest(url, searchText, filters, pageCount) {
  const PRODUCT_NAMES = [];
  const PRODUCT_PRICES = [];

  const browser = await firefox.launch({
    headless: false,
  });

  const contextWithUserAgent = await browser.newContext({
    userAgent: USER_AGENT,
  });

  const page = await contextWithUserAgent.newPage();

  await page.goto(url, { timeout: 90000 });

  await expect(page).toHaveTitle(PAGE_TITLE);
  async function collectRecords() {
    try {
      const searchBar = page.getByPlaceholder(PLACE_HOLDER);
      const newSearch = (await searchBar.isVisible())
        ? searchBar
        : page.getByTitle("Search For");
      await newSearch.click();
      await newSearch.fill(searchText);
      await page.keyboard.press("Enter");

      await page.waitForLoadState("load");
      await expect(page).toHaveTitle(`Amazon.in : ${searchText}`);

      async function applyFilter(list) {
        if (list.some((d) => d.toLowerCase() == "all")) return true;
        for (let item of list) {
          await page.waitForLoadState("load");
          await page.getByRole("link", { name: item, exact: true }).click();
        }
      }
      await applyFilter(filters);
      await page.waitForLoadState("load");

      async function getNameAndPrice() {
        const productNames = await page.$$("h2 > a > span");
        const productPrices = await page.$$(".a-price-whole");
        for (let name of productNames) {
          const text = await name.textContent();
          // console.log("\n ProductName: ", text);
          PRODUCT_NAMES.push(text);
        }
        for (let price of productPrices) {
          const amt = await price.textContent();
          // console.log("\n ProductPrice: ", amt);
          PRODUCT_PRICES.push(amt);
        }
      }

      if (pageCount > 1) {
        let rep = 2;
        while (rep <= pageCount) {
          await getNameAndPrice();
          await page.getByLabel(`Go to next page, page ${rep}`).click();
          rep++;
        }

        browser.close();

        return formatData({ PRODUCT_NAMES, PRODUCT_PRICES });
      }
      await getNameAndPrice();
      browser.close();

      return formatData({ PRODUCT_NAMES, PRODUCT_PRICES });
    } catch (e) {
      console.log("Error:- ", e);
    }
  }
  const nameAndPriceData = await collectRecords();
  return nameAndPriceData;
}

function formatData(data) {
  // console.log("Product Name Length:- ", data?.PRODUCT_NAMES.length);
  // console.log("Product Price Length:- ", data?.PRODUCT_PRICES.length);
  return data?.PRODUCT_NAMES.map((d, i) => {
    return [d, data?.PRODUCT_PRICES[i]];
  });
}

async function main() {
  const inputDataArr = testData["Data"];
  for (let obj of inputDataArr) {
    const { url, searchProduct, mobileBrand, exportCount } = obj;
    const returnData = await doTest(
      url,
      searchProduct,
      mobileBrand,
      exportCount
    );

    console.log("Products:- ", returnData);
    await exportToExcel(
      returnData,
      mobileBrand.reduce((el, acc) => `${acc} and ${el}`)
    );
  }
}

main();
