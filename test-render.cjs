const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const express = require('express');

const distPath = path.join(__dirname, 'dist');
const htmlPath = path.join(distPath, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const app = express();
app.use(express.static(distPath));
const server = app.listen(8080, () => {
  const dom = new JSDOM(html, {
    url: "http://localhost:8080/",
    runScripts: "dangerously",
    resources: "usable"
  });

  const virtualConsole = dom.virtualConsole;
  virtualConsole.on("error", (err) => { console.error("[VC ERROR]:", err); });
  virtualConsole.on("warn", (warn) => { console.warn("[VC WARN]:", warn); });
  virtualConsole.on("jsdomError", (err) => { console.error("[JSDOM ERROR]:", err); });
  virtualConsole.on("log", (msg) => { console.log("[DOM LOG]:", msg); });

  dom.window.addEventListener("error", (event) => {
    console.error("[WINDOW ERROR]:", event.error?.message || event.message);
  });

  dom.window.addEventListener("unhandledrejection", (event) => {
    console.error("[UNHANDLED REJECTION]:", event.reason?.message || event.reason);
  });

  setTimeout(() => {
    const root = dom.window.document.getElementById('root');
    console.log("Root HTML after 5s:", root ? root.innerHTML.substring(0, 500) : 'NO ROOT');
    server.close();
    process.exit(0);
  }, 5000);
});