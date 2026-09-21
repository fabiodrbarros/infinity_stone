import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await page.goto('http://localhost:3000');await page.waitForLoadState('networkidle');await page.screenshot({path:'.impeccable/review/tura-home.png'});
await browser.close();
