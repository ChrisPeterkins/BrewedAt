const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const routes = [
  { path: '/', output: 'index.html' },
  { path: '/for-business', output: 'for-business.html' },
  { path: '/events', output: 'events.html' },
  { path: '/podcast', output: 'podcast.html' },
];

const BASE_URL = 'http://localhost:3000/brewedat';
const OUTPUT_DIR = path.join(__dirname, '../../dist/public');

async function prerender() {
  console.log('🚀 Starting pre-rendering...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const route of routes) {
      console.log(`📄 Pre-rendering: ${route.path}`);

      const page = await browser.newPage();

      // Navigate to the route
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait a bit for React Helmet to update meta tags
      await page.waitForTimeout(1000);

      // Get the fully rendered HTML
      const html = await page.content();

      // Write to file
      const outputPath = path.join(OUTPUT_DIR, route.output);
      fs.writeFileSync(outputPath, html);

      console.log(`   ✅ Saved to: ${route.output}`);

      await page.close();
    }

    console.log('\n✨ Pre-rendering complete!');
  } catch (error) {
    console.error('❌ Error during pre-rendering:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Check if we're running this as a standalone script
if (require.main === module) {
  prerender();
}

module.exports = { prerender };
