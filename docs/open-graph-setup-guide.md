# Open Graph & Social Media Preview Setup Guide

## What You're Seeing Now

Currently when you share BrewedAt links, they show a generic preview because:
1. You're using a React SPA (Single Page Application)
2. All routes use the same `index.html` file with the same meta tags
3. Social media crawlers can't see route-specific content

## What Creates Rich Link Previews

When you share a link on iPhone Messages, WhatsApp, LinkedIn, Twitter, etc., they scrape your page for:

1. **Title** - `<meta property="og:title">`
2. **Description** - `<meta property="og:description">`
3. **Image** - `<meta property="og:image">` (ideally 1200x630px)
4. **URL** - `<meta property="og:url">`

## Current Setup (Basic)

I've added default Open Graph tags to your `index.html`:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://chrispeterkins.com/brewedat/">
<meta property="og:title" content="BrewedAt | Local Beer Events & Happenings">
<meta property="og:description" content="Tap into the local craft beverage scene...">
<meta property="og:image" content="https://chrispeterkins.com/brewedat/beer-background-optimized.jpg">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BrewedAt | Local Beer Events & Happenings">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

**This works for the homepage**, but all routes (like `/for-business`) will show the same preview.

---

## Solution Options

### Option 1: React Helmet (Recommended for React Apps)

Install and use `react-helmet-async` to dynamically update meta tags per page.

**Install:**
```bash
npm install react-helmet-async
```

**Setup in App.tsx:**
```tsx
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router basename="/brewedat">
          {/* ... */}
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}
```

**Use in ForBusinessPage.tsx:**
```tsx
import { Helmet } from 'react-helmet-async';

export default function ForBusinessPage() {
  return (
    <>
      <Helmet>
        <title>Partner with BrewedAt | Craft Beer Marketing</title>
        <meta name="description" content="Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers. Flexible retainer packages starting at $1,000/month." />

        {/* Open Graph */}
        <meta property="og:title" content="Partner with BrewedAt | Craft Beer Marketing" />
        <meta property="og:description" content="Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network." />
        <meta property="og:image" content="https://chrispeterkins.com/brewedat/business-preview.jpg" />
        <meta property="og:url" content="https://chrispeterkins.com/brewedat/for-business" />

        {/* Twitter */}
        <meta name="twitter:title" content="Partner with BrewedAt" />
        <meta name="twitter:description" content="Retainer packages starting at $1,000/month" />
        <meta name="twitter:image" content="https://chrispeterkins.com/brewedat/business-preview.jpg" />
      </Helmet>

      {/* Your page content */}
      <div>...</div>
    </>
  );
}
```

**⚠️ Limitation:** Client-side meta tag updates don't always work for social media crawlers because they don't execute JavaScript. They just read the initial HTML.

---

### Option 2: Pre-rendering / Static Site Generation (Best for SEO)

Use a tool like:
- **Vite Plugin SSG** - Pre-renders pages at build time
- **React Snap** - Takes snapshots of your routes
- **Prerender.io** - Cloud service that pre-renders pages

This generates actual HTML files for each route with proper meta tags baked in.

---

### Option 3: Server-Side Rendering (SSR)

Convert to:
- **Next.js** (React SSR framework)
- **Remix** (React SSR framework)
- Custom Express + React SSR

This is the most robust solution but requires a complete architecture change.

---

### Option 4: Simple Redirect Pages (Quick Fix)

Create separate static HTML pages that redirect to your React app:

**Create `/var/www/chrispeterkins.com/brewedat/for-business.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Partner with BrewedAt | Craft Beer Marketing</title>
    <meta name="description" content="Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers">

    <!-- Open Graph -->
    <meta property="og:title" content="Partner with BrewedAt | Craft Beer Marketing">
    <meta property="og:description" content="Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network.">
    <meta property="og:image" content="https://chrispeterkins.com/brewedat/business-preview.jpg">
    <meta property="og:url" content="https://chrispeterkins.com/brewedat/for-business">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Partner with BrewedAt">
    <meta name="twitter:description" content="Retainer packages starting at $1,000/month">
    <meta name="twitter:image" content="https://chrispeterkins.com/brewedat/business-preview.jpg">

    <!-- Instant redirect to React app -->
    <meta http-equiv="refresh" content="0; url=/brewedat/#/for-business">
    <script>window.location.href='/brewedat/#/for-business';</script>
</head>
<body>
    <p>Redirecting to BrewedAt business page...</p>
</body>
</html>
```

Configure nginx to serve this for `/brewedat/for-business` requests from social media crawlers.

---

## Creating Preview Images

For the best link previews, create custom images:

### Recommended Specs:
- **Size**: 1200 x 630 pixels
- **Format**: JPG or PNG
- **File size**: Under 1MB
- **Safe zone**: Keep text/logos within center 1200x600px

### Images Needed:

1. **Homepage** (`brewedat-home-preview.jpg`)
   - BrewedAt logo
   - Tagline: "Tap Into the Local Craft Beverage Scene"
   - Background: Beer/community image

2. **For Business Page** (`brewedat-business-preview.jpg`)
   - "Partner with BrewedAt"
   - Key stats: "10K+ Followers • 765+ Brewery Pros"
   - "Retainer Packages Starting at $1,000/mo"
   - Navy & orange brand colors

3. **Events Page** (`brewedat-events-preview.jpg`)
   - "Discover Local Beer Events"
   - Event photos

### Quick Tool:
Use Canva.com - they have Open Graph templates (1200x630px)

---

## Testing Your Previews

### Before Going Live:
1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Click "Scrape Again" to refresh cache

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Enter URL
   - See preview

3. **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
   - Enter URL
   - See how it looks

4. **Open Graph Check**: https://www.opengraph.xyz/
   - Quick preview tool

### Clear Cache:
Social platforms cache previews for days/weeks. Use their debug tools to force a refresh.

---

## Recommended Implementation Plan

**Phase 1: Quick Wins (This week)**
1. ✅ Add default OG tags to index.html (DONE)
2. Create 3 preview images (homepage, business, events)
3. Upload images to `/brewedat/` folder

**Phase 2: Per-Page Meta Tags (Next week)**
1. Install `react-helmet-async`
2. Add Helmet to all major pages:
   - HomePage
   - ForBusinessPage
   - EventsPage
   - PodcastPage
3. Test with Facebook Debugger

**Phase 3: Advanced (Future)**
1. Research pre-rendering options (React Snap or Vite SSG)
2. Implement if needed for better SEO/social sharing

---

## Example Meta Tags for Each Page

### Homepage
```
Title: BrewedAt | Local Beer Events & Happenings
Description: Tap into the local craft beverage scene. Discover events, podcasts, and connect with the craft beer community in PA & NJ.
Image: brewedat-home-preview.jpg
```

### For Business Page
```
Title: Partner with BrewedAt | Craft Beer Marketing & Sponsorships
Description: Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network. Retainer packages starting at $1,000/month.
Image: brewedat-business-preview.jpg
```

### Events Page
```
Title: Craft Beer Events in PA & NJ | BrewedAt
Description: Discover local brewery events, tastings, and craft beer happenings across Pennsylvania and New Jersey.
Image: brewedat-events-preview.jpg
```

### Podcast Page
```
Title: The BrewedAt Podcast | Craft Beer Industry Insights
Description: In-depth conversations with brewery owners, bar operators, and industry leaders. 1.8M views, 30K downloads.
Image: brewedat-podcast-preview.jpg
```

---

## Quick Reference: Meta Tag Cheat Sheet

```html
<!-- Basic SEO -->
<title>Your Page Title</title>
<meta name="description" content="Your page description">

<!-- Open Graph (Facebook, LinkedIn, WhatsApp) -->
<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Your page description">
<meta property="og:image" content="https://yoursite.com/image.jpg">
<meta property="og:url" content="https://yoursite.com/page">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Page Title">
<meta name="twitter:description" content="Your page description">
<meta name="twitter:image" content="https://yoursite.com/image.jpg">

<!-- Image specs -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

---

## Priority Actions

1. **Create preview images** - This is the biggest visual impact
2. **Install React Helmet** - Easy to implement, immediate benefit
3. **Test with debugger tools** - Verify everything works
4. **Consider pre-rendering later** - For maximum compatibility

---

## Questions?

- Facebook Debugger keeps showing old image? Clear cache using "Scrape Again"
- Image not showing? Check file permissions and absolute URL
- Different preview on different platforms? They cache independently
- React Helmet not working for social crawlers? Consider pre-rendering

---

**Status**:
- ✅ Default OG tags added to index.html
- ⚠️ Need custom preview images
- ⚠️ Need React Helmet for per-page tags
- ⚠️ May need pre-rendering for full compatibility
