import { chromium } from "playwright-core";
const U = "https://temporary-fast-bugle-wl6foc2.vercel.app";
const email = `prod${Date.now()}@example.com`;
const b = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const p = await b.newPage();
p.on("request", r => { if (r.isNavigationRequest()) console.log("  NAV ->", r.url()); });
p.on("response", async r => {
  if (r.url().includes("/api/auth") || r.status() >= 300 && r.status() < 400) {
    console.log("  RESP", r.status(), r.url(), "| location:", r.headers()["location"] ?? "-");
  }
});
await p.goto(`${U}/signup`, { waitUntil: "networkidle", timeout: 60000 });
await p.fill("#name", "Prod Check");
await p.fill("#email", email);
await p.fill("#password", "supersecret123");
await p.click('button[type="submit"]');
await p.waitForTimeout(9000);
console.log("FINAL URL:", p.url());
await b.close();
