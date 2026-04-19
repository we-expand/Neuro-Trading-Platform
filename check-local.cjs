const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
const server = app.listen(8080, async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  console.log("Navigating to http://neuraldaytrader-cnpsgos9m-cleber-coutos-projects.vercel.app...");
  await page.goto('http://neuraldaytrader-cnpsgos9m-cleber-coutos-projects.vercel.app');
  
  console.log("Waiting 3 seconds...");
  await new Promise(r => setTimeout(r, 8000));
  
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'NO ROOT');
  if (rootHtml.length > 20 && !rootHtml.includes('display: flex')) {
    console.log('✅ APP RENDERED SUCESSFULLY! Length:', rootHtml.length);
  } else {
    console.log('❌ FALLBACK OR EMPTY:', rootHtml);
  }
  
  await browser.close();
  server.close();
  process.exit(0);
});