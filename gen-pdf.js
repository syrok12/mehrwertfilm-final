const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const htmlPath = path.resolve("copy/fragenkatalog-zielgruppe-print.html");
  await page.goto("file:///" + htmlPath.replace(/\\/g, "/"), { waitUntil: "networkidle0" });
  await page.pdf({
    path: "copy/fragenkatalog-zielgruppe.pdf",
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });
  await browser.close();
  console.log("OK");
})();
