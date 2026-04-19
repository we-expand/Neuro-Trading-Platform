const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  console.log("Navigating to https://neuraldaytrader-3kml7emm3-cleber-coutos-projects.vercel.app...");
  try {
    await page.goto('https://neuraldaytrader-3kml7emm3-cleber-coutos-projects.vercel.app', { waitUntil: 'networkidle0', timeout: 15000 });
  } catch(e) {
    console.error("Navigation error:", e.message);
  }
  
  console.log("DOM BODY HTML:");
  const body = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
  console.log(body);

  await browser.close();
})();