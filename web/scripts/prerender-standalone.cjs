const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

const routes = [
  { path: '/', output: 'index.html' },
  { path: '/for-business', output: 'for-business.html' },
  { path: '/events', output: 'events.html' },
  { path: '/podcast', output: 'podcast.html' },
];

const PORT = 3456;
const BASE_URL = `http://localhost:${PORT}/brewedat`;
const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_DIR = path.join(DIST_DIR, 'public');

async function startServer() {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: DIST_DIR,
      cleanUrls: false,
      directoryListing: false,
      rewrites: [{ source: '/brewedat/**', destination: '/brewedat/index.html' }],
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`🌐 Serving files at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  console.log('🚀 Starting pre-rendering...\n');

  // Start local server
  const server = await startServer();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const route of routes) {
      console.log(`📄 Pre-rendering: ${route.path}`);

      const page = await browser.newPage();

      try {
        // Navigate to the route
        await page.goto(`${BASE_URL}${route.path}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Wait for React Helmet to update meta tags
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the fully rendered HTML
        let html = await page.content();

        // Remove duplicate meta tags (keep only React Helmet ones with data-rh="true")
        // Find all React Helmet meta tags (with data-rh="true")
        const rhMetaTags = new Set();

        // Find all meta tags with data-rh="true" using regex
        const rhMetaRegex = /<meta\s+(property|name)="([^"]+)"[^>]*data-rh="true"[^>]*>/g;
        let match;
        while ((match = rhMetaRegex.exec(html)) !== null) {
          rhMetaTags.add(match[2]); // match[2] is the property or name value
        }

        console.log(`   Found ${rhMetaTags.size} React Helmet meta tags:`, Array.from(rhMetaTags));

        // Now remove original meta tags for properties/names that have RH versions
        let removedCount = 0;
        html = html.replace(/<meta\s+(property|name)="([^"]+)"[^>]*?>/g, (match, attrType, attrValue) => {
          // If this meta tag has a React Helmet version and this one doesn't have data-rh, remove it
          if (rhMetaTags.has(attrValue) && !match.includes('data-rh="true"')) {
            removedCount++;
            return '';
          }
          return match;
        });

        console.log(`   Removed ${removedCount} duplicate meta tags`);

        // Write to file
        const outputPath = path.join(OUTPUT_DIR, route.output);
        fs.writeFileSync(outputPath, html);

        console.log(`   ✅ Saved to: ${route.output}`);
      } catch (error) {
        console.error(`   ❌ Error rendering ${route.path}:`, error.message);
      }

      await page.close();
    }

    console.log('\n✨ Pre-rendering complete!');
  } catch (error) {
    console.error('❌ Error during pre-rendering:', error);
  } finally {
    await browser.close();
    server.close();
    console.log('🛑 Server stopped');
  }
}

prerender();
