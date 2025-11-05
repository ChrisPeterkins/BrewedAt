# BrewedAt Retainer Services - Design & Implementation Plan

## Executive Summary

This document outlines the design and implementation strategy for adding B2B retainer service pages to the BrewedAt website. The goal is to create a professional, conversion-focused experience that matches the existing brand design while effectively communicating value propositions to potential business partners.

---

## 1. Current Website Analysis

### Brand Identity
- **Primary Color**: Navy blue (#1f3540)
- **Accent Color**: Orange (#fd5526)
- **Background Colors**: Light beige (#fef5e7), gray (#f5f5f5), white
- **Typography**: Poppins (headings), Rubik (body)
- **Design Style**: Modern, clean, community-focused with warm tones

### Existing Page Structure
The current homepage follows this pattern:
1. **Hero Section**: Full-width image background with centered content and CTA buttons
2. **Content Sections**: Alternating background colors (beige, gray, white)
3. **Split Layouts**: 50/50 text and visual content
4. **CTAs**: Prominent buttons with hover effects
5. **Cards**: Rounded corners, shadows on hover, border treatments

### Key Design Elements to Match
- Large, bold headings with clamp() for responsive sizing
- Generous padding (80-100px vertical)
- Box shadows: `0 10px 30px var(--shadow-medium)` on hover
- Border radius: 12-16px for cards
- Transitions: 0.3s ease for all interactive elements
- Transform on hover: `translateY(-5px)` for cards

---

## 2. Proposed Page Structure

### New Pages to Create

#### A. `/business` - Main B2B Landing Page
**Purpose**: Primary entry point for businesses interested in partnership opportunities

**URL**: `/business` or `/for-business` or `/partners`

**Sections**:
1. **Hero Section**
   - Headline: "Partner with BrewedAt to Reach the Craft Beverage Community"
   - Subheadline: Mission statement emphasizing Gen Z connection
   - Background: Professional photo from deck (brewery/podcast scene)
   - CTA: "View Retainer Packages" + "Contact Us"

2. **Value Proposition Section** (3-column grid)
   - Access to Decision-Makers (765+ brewery owners/staff)
   - Multi-Channel Reach (Podcast + Social + Events)
   - Gen Z Expertise (Native understanding of target demographic)

3. **Services Overview** (Split layout sections)
   - BrewedAt Podcast (with metrics)
   - Social Media Network (with audience breakdown)
   - Crafted In Events (with 2025 results)
   - Event Network Partnerships

4. **By The Numbers** (Stats grid)
   - 3,500 podcast followers
   - 1.8M total podcast views
   - 10,000+ social followers
   - 5.3M+ social views
   - 1,254 brewery visits driven (Crafted In 2025)

5. **Retainer Packages Comparison** (Card grid - 4 columns)
   - Flight Package ($1,000/mo)
   - Pint Package ($2,187/mo)
   - Growler Package ($4,500/mo)
   - Keg Package ($8,500/mo)
   - Each card: Name, Price, Key Features (3-4 bullets), "Learn More" CTA

6. **Partner Logos Showcase**
   - "Trusted by Leading Brands"
   - Display local & national partner logos from deck

7. **CTA Section**
   - "Ready to Tap Into Our Network?"
   - Contact form or "Schedule a Call" button

#### B. `/retainer-packages` - Detailed Package Information
**Purpose**: In-depth breakdown of each retainer option

**Sections**:
1. **Hero**
   - "Choose Your Partnership Level"
   - Tagline about flexibility and customization

2. **Interactive Package Comparison Table**
   - Side-by-side comparison of all 4 packages
   - Expandable rows for detailed features
   - Sticky header on scroll
   - Highlight differences between tiers

3. **Per-Package Detailed Breakdowns**
   - Full-page section for each package
   - What's included (categorized):
     - Podcast Sponsorship
     - Social Media Features
     - Event Opportunities
     - Network Benefits
   - Real deliverables with numbers
   - Visual examples where applicable

4. **Add-On Services** (Optional)
   - Food & Booze Passport sponsorships
   - Custom event creation
   - Additional event bookings

5. **FAQ Section**
   - Contract terms
   - Payment structure
   - Reporting and analytics
   - Customization options

6. **Next Steps CTA**
   - Contact form for quote requests
   - Link to schedule consultation

#### C. `/network` - Network & Audience Page
**Purpose**: Showcase reach, audience demographics, and event partnerships

**Sections**:
1. **Hero**
   - "Tap Into the BrewedAt Network"
   - Visual of network map or audience graphic

2. **Audience Breakdown**
   - Demographics (age, gender, location)
   - Psychographics (interests, behaviors)
   - Dual audience: Consumers + Industry Professionals

3. **Content Properties**
   - **Podcast Deep Dive**
     - Guest highlights with view counts
     - Platform distribution
     - Listener demographics
     - Notable episodes

   - **Social Media Breakdown**
     - Platform-by-platform metrics
     - Content types and engagement
     - Industry follower analysis (765+ brewery accounts)

   - **Crafted In Series**
     - How it works (step-by-step)
     - 2025 performance data
     - Participating breweries map
     - Press mentions

4. **Event Network Partners**
   - Home Brewed Events overview
   - Brewers of Pennsylvania overview
   - Event calendar with attendance figures
   - Sponsorship examples

5. **Case Studies / Success Stories** (If available)
   - Partner testimonials
   - Campaign results
   - ROI examples

#### D. `/contact-sales` - Lead Capture Page
**Purpose**: Convert interested businesses into qualified leads

**Sections**:
1. **Hero**
   - "Let's Build a Partnership"
   - Brief value statement

2. **Contact Form**
   - Company name
   - Contact person
   - Email
   - Phone (optional)
   - Business type (dropdown: Supplier, Brewery, Brand, Other)
   - Interested in (checkboxes: Podcast, Social, Events, Full Retainer)
   - Budget range (dropdown)
   - Message/Goals
   - Submit CTA: "Get a Custom Quote"

3. **Sidebar**
   - Direct contact information (Evan & Cole)
   - Expected response time
   - Alternative contact methods
   - Download media kit option

4. **Trust Indicators**
   - Partner logos
   - Quick stats
   - "As featured in" press logos

---

## 3. Design Specifications

### Page Templates

#### Hero Sections
```css
Background: Full-width image with overlay
Padding: 140px 20px 80px
Overlay: rgba(0,0,0,0.25) with backdrop-filter blur
Text: White with text-shadow
Max-width: 900px centered
```

#### Content Sections
```css
Padding: 80px 0
Background: Alternating (white, #fef5e7, #f5f5f5)
Container: max-width 1200px
```

#### Cards
```css
Background: white or #f5f5f5
Border-radius: 16px
Border: 2px solid #E0E0E0
Padding: 30-40px
Hover: transform translateY(-5px), box-shadow, border-color #fd5526
```

#### Stats Display
```css
.stat-number:
  font-size: 2.5rem
  font-weight: 700
  color: #fd5526

.stat-label:
  font-size: 0.875rem
  color: #25303d
```

### Component Designs

#### Package Comparison Cards
```jsx
<div className="package-card">
  <div className="package-header">
    <div className="package-icon">🍺</div> {/* Different for each tier */}
    <h3>Flight Package</h3>
    <div className="package-price">
      <span className="price-amount">$1,000</span>
      <span className="price-period">/month</span>
    </div>
  </div>
  <div className="package-features">
    <ul>
      <li>✓ 24 Podcast Episodes</li>
      <li>✓ Crafted In Inclusion</li>
      <li>✓ Social Media Features</li>
      <li>✓ Can Art Bracket</li>
    </ul>
  </div>
  <button className="btn-primary">Learn More</button>
</div>
```

#### Metrics Display Component
```jsx
<div className="metrics-grid">
  <div className="metric-card">
    <div className="metric-icon">📊</div>
    <div className="metric-value">1.8M</div>
    <div className="metric-label">Podcast Views</div>
  </div>
  {/* Repeat for each metric */}
</div>
```

#### Timeline Component (for Event Calendar)
```jsx
<div className="event-timeline">
  <div className="timeline-event">
    <div className="event-month">MAY</div>
    <div className="event-details">
      <h4>Sly Fox Bock Fest</h4>
      <p>Pottstown, PA • 1,500-4,500 attendees</p>
    </div>
  </div>
  {/* Repeat for each event */}
</div>
```

---

## 4. Content Strategy

### Messaging Hierarchy
1. **Primary Message**: "Connect with craft beverage decision-makers AND passionate consumers"
2. **Secondary Message**: "Gen Z-owned company with authentic community connections"
3. **Proof Points**: Metrics, partner logos, event attendance, demographic data
4. **Differentiation**: Dual B2B/B2C audience, multi-channel approach, event network access

### Tone of Voice
- Professional but approachable
- Data-driven but not dry
- Community-focused
- Partnership language (not vendor/client)
- Gen Z authentic (avoid corporate jargon)

### Value Propositions by Audience Segment

**For Suppliers/Vendors:**
- Direct access to brewery decision-makers (765+)
- Hand-delivery opportunities (swag boxes, business cards)
- Event sponsorship facilitation

**For Breweries:**
- Consumer exposure through social/podcast
- Event participation opportunities
- Community building

**For Brands:**
- Multi-channel reach
- Authentic Gen Z connection
- Measured results with monthly reports

---

## 5. SEO Strategy

### Target Keywords

**Primary Keywords:**
- "craft beer marketing Philadelphia"
- "brewery podcast sponsorship"
- "craft beverage marketing agency"
- "Gen Z beer marketing"
- "Philadelphia brewery events"

**Long-tail Keywords:**
- "sponsor craft beer podcast"
- "reach brewery owners Philadelphia"
- "craft beer influencer marketing"
- "brewery event sponsorship Pennsylvania"
- "Gen Z craft beer audience"

### Page SEO

**`/business` Page:**
```html
<title>Partner with BrewedAt | Craft Beer Marketing & Sponsorships</title>
<meta name="description" content="Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through BrewedAt's podcast, social media, and event network. Gen Z-owned marketing solutions.">
<meta name="keywords" content="craft beer marketing, brewery sponsorship, podcast advertising, Philadelphia beer events">
```

**`/retainer-packages` Page:**
```html
<title>Retainer Packages | BrewedAt Marketing Services</title>
<meta name="description" content="Choose from 4 flexible retainer packages ($1K-$8.5K/month) including podcast sponsorship, social media features, and craft beer event access.">
```

**`/network` Page:**
```html
<title>Our Network & Reach | BrewedAt Audience Demographics</title>
<meta name="description" content="Access 1.8M podcast views, 10K+ social followers, and 765+ brewery professionals. View our audience demographics and event partnerships.">
```

### Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "BrewedAt Marketing Retainer",
  "provider": {
    "@type": "Organization",
    "name": "BrewedAt LLC",
    "url": "https://brewedat.com"
  },
  "areaServed": ["Pennsylvania", "New Jersey", "Delaware"],
  "audience": {
    "@type": "Audience",
    "audienceType": "Craft Beverage Industry"
  }
}
```

---

## 6. Conversion Optimization

### CTAs Placement & Hierarchy

**Primary CTAs:**
- "View Retainer Packages" (hero sections)
- "Get a Custom Quote" (contact forms)
- "Schedule a Consultation" (high-intent pages)

**Secondary CTAs:**
- "Download Media Kit"
- "View Our Network"
- "See Past Partnerships"

**Micro-CTAs:**
- "Learn More" (package cards)
- "View Details" (event listings)
- Social proof: "Join [Partner Name] and others"

### Lead Capture Strategy

**Progressive Disclosure:**
1. Landing page → High-level overview
2. Retainer packages → Detailed features
3. Contact form → Qualified lead capture
4. Follow-up email → Media kit + consultation booking

**Form Fields** (Keep minimal for higher conversion):
- Required: Name, Email, Company, Interest Area
- Optional: Phone, Budget, Message
- Hidden: UTM parameters, referring page

### Trust Building Elements
- Partner logo wall
- Metrics with sources
- Press mentions
- Contact photos (Evan & Cole with bios)
- Money-back or satisfaction guarantee (if applicable)
- Clear next steps

---

## 7. Mobile Responsiveness

### Breakpoints (Match existing site)
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

### Mobile Optimizations
1. **Package comparison**: Stack cards vertically instead of 4-column grid
2. **Stats grids**: 2-column on tablet, 1-column on mobile
3. **Hero images**: Adjust background-position for mobile crops
4. **Forms**: Full-width inputs, larger touch targets (44px min)
5. **Navigation**: Add "For Business" to mobile menu

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create `/business` landing page
- [ ] Design and implement package comparison cards
- [ ] Add business CTA to main navigation
- [ ] Set up basic contact form

**Deliverables:**
- Functional landing page
- Working contact form
- Navigation updates

### Phase 2: Detailed Content (Week 3-4)
- [ ] Create `/retainer-packages` page with full breakdowns
- [ ] Build interactive package comparison table
- [ ] Add FAQ section
- [ ] Create `/network` audience demographics page

**Deliverables:**
- Complete package information architecture
- Detailed service descriptions
- Audience data visualizations

### Phase 3: Optimization (Week 5-6)
- [ ] Add image optimization for deck graphics
- [ ] Implement structured data/SEO
- [ ] A/B test CTAs and headlines
- [ ] Add analytics tracking (button clicks, form submissions)
- [ ] Create downloadable media kit PDF

**Deliverables:**
- SEO-optimized pages
- Analytics dashboard
- Performance metrics

### Phase 4: Enhancement (Week 7-8)
- [ ] Add partner testimonials (if available)
- [ ] Create case study pages
- [ ] Implement lead scoring system
- [ ] Email automation for form submissions
- [ ] Create retargeting pixel for ads

**Deliverables:**
- Sales automation
- Enhanced conversion tracking
- Marketing funnel setup

---

## 9. Technical Requirements

### New Routes
```javascript
// In App.tsx or routing config
<Route path="/business" element={<BusinessPage />} />
<Route path="/retainer-packages" element={<RetainerPackagesPage />} />
<Route path="/network" element={<NetworkPage />} />
<Route path="/contact-sales" element={<ContactSalesPage />} />
```

### New Components to Build
1. `PackageCard.tsx` - Reusable package display
2. `PackageComparison.tsx` - Side-by-side comparison table
3. `MetricCard.tsx` - Statistics display
4. `EventTimeline.tsx` - Event calendar visualization
5. `PartnerLogos.tsx` - Logo carousel/grid
6. `ContactForm.tsx` - Lead capture form
7. `PricingToggle.tsx` - Monthly/annual toggle (if needed)
8. `FeatureList.tsx` - Checkmark list component

### Firebase Integration
```javascript
// New collection for business inquiries
const businessInquiriesRef = collection(db, 'businessInquiries');

// Form submission handler
const submitInquiry = async (formData) => {
  await addDoc(businessInquiriesRef, {
    ...formData,
    timestamp: serverTimestamp(),
    status: 'new'
  });

  // Send notification email
  await sendEmailNotification(formData);
};
```

### Email Notifications
- Send to: info@brewedat.com, Evan & Cole
- Include: All form data, timestamp, reply link
- Auto-response to submitter with next steps

---

## 10. Analytics & Tracking

### Events to Track
1. **Page Views**:
   - /business
   - /retainer-packages
   - /network
   - /contact-sales

2. **Engagement**:
   - CTA button clicks
   - Package card clicks
   - Video/embed plays
   - Time on page
   - Scroll depth

3. **Conversions**:
   - Form submissions
   - Email clicks
   - Phone clicks
   - Media kit downloads

4. **User Flow**:
   - Entry pages → conversion path
   - Drop-off points
   - Most common navigation paths

### Goal Setup (Google Analytics)
- Goal 1: Contact form submission (primary conversion)
- Goal 2: Media kit download (micro-conversion)
- Goal 3: 2+ minutes on /business page (engagement)
- Goal 4: Email/phone click (contact intent)

### Success Metrics (KPIs)
- **Traffic**: 500+ monthly visits to /business within 3 months
- **Engagement**: 2+ min average time on page, <50% bounce rate
- **Conversion**: 5% form submission rate
- **Qualified Leads**: 10+ monthly inquiries

---

## 11. Content Assets Needed

### Images from Retainer Deck
1. **Hero Images**:
   - Podcast recording setup
   - Brewery event crowd shots
   - Beer tasting/community moments

2. **Property Logos**:
   - BrewedAt Podcast logo
   - Crafted In Philly logo
   - Crafted In Jersey logo
   - Food & Booze Passport logo

3. **Partner Logos**:
   - Extract all partner logos from deck page 2
   - Optimize to ~100KB each

4. **Screenshots**:
   - Instagram profile mockup
   - Social media engagement examples
   - Podcast platform listings

### New Assets to Create
1. **Comparison graphics**: Package tier visualizations
2. **Infographics**: Audience demographics, event timeline
3. **Icons**: Custom icons for features/benefits
4. **Headshots**: Evan Blum & Cole Decker (if not already available)

### Copy Assets
1. **Package descriptions**: Expand bullet points into paragraphs
2. **Service pages**: Long-form content for each offering
3. **FAQs**: 10-15 common questions
4. **Meta descriptions**: All pages, <160 characters
5. **Email templates**: Auto-responses, notifications

---

## 12. Legal & Compliance

### Required Pages/Sections
- [ ] Terms of Service (update for B2B services)
- [ ] Privacy Policy (update for lead capture)
- [ ] Cookie notice (if tracking added)
- [ ] Contract templates (link to or mention)

### Disclaimers
- "Pricing subject to change"
- "Custom packages available"
- "Results not guaranteed" (if including metrics projections)

---

## 13. Post-Launch Activities

### Marketing Checklist
- [ ] Announce new B2B services on social media
- [ ] Email current partners about formal retainer options
- [ ] Update LinkedIn company page
- [ ] Submit to business directories
- [ ] Reach out to past event sponsors
- [ ] Create LinkedIn ads targeting brewery owners
- [ ] Write blog post: "Introducing BrewedAt Retainer Services"

### Optimization Plan
- **Week 1**: Monitor analytics, fix any UX issues
- **Week 2**: A/B test headlines and CTAs
- **Week 3**: Add testimonials if collected
- **Week 4**: Adjust pricing display based on user behavior
- **Month 2**: Create case studies from first clients
- **Month 3**: Expand content with additional blog posts

---

## 14. Budget Estimate (If Outsourcing)

### Design & Development
- Page design (4 pages × 8 hours): 32 hours @ $75-150/hr = $2,400-$4,800
- Component development: 20 hours @ $75-150/hr = $1,500-$3,000
- Form integration & testing: 8 hours @ $75-150/hr = $600-$1,200
- **Total Development**: $4,500-$9,000

### Content Creation
- Copywriting (4 pages): $800-$1,500
- Image extraction & optimization: $200-$400
- SEO metadata: $200-$400
- **Total Content**: $1,200-$2,300

### Tools & Services
- Form service (if using third-party): $20-50/month
- Email automation: $30-100/month
- Analytics tools: Free (Google Analytics)

**Total Estimated Cost**: $5,700-$11,300 one-time + $50-150/month

---

## 15. Success Criteria

### Launch Metrics (First 30 Days)
- ✅ All pages live and functional
- ✅ Contact form receiving submissions
- ✅ Pages ranking for brand name + "retainer" searches
- ✅ No broken links or major UX issues
- ✅ Mobile responsiveness confirmed

### 90-Day Goals
- 🎯 300+ visits to /business page
- 🎯 10+ qualified leads submitted
- 🎯 1-2 retainer packages sold
- 🎯 <60% bounce rate on business pages
- 🎯 Top 10 Google ranking for "BrewedAt retainer" or similar brand terms

### 6-Month Goals
- 🎯 1,000+ visits to /business page
- 🎯 40+ qualified leads
- 🎯 3-5 active retainer clients
- 🎯 Organic traffic from non-brand keywords
- 🎯 Featured in at least one industry publication

---

## 16. Next Steps

1. **Review & Approve**: Share this plan with stakeholders (Evan, Cole)
2. **Prioritize**: Confirm which pages to build first
3. **Asset Gathering**: Collect all images, logos, and content from deck
4. **Wireframe**: Create low-fidelity wireframes for approval
5. **Build Phase 1**: Start with /business landing page
6. **Test & Iterate**: Get feedback before expanding to other pages
7. **Launch**: Soft launch to partners, then full announcement

---

## Appendix A: Competitive Analysis

### Similar Offerings to Study
- Brewery marketing agencies (e.g., The Craft Connect, Beer Marketing)
- Podcast sponsorship platforms (Podcorn, AdvertiseCast)
- Event marketing companies with retainer models

### What They Do Well
- Clear pricing displays
- Case studies prominently featured
- Simple contact forms
- Trust indicators (logos, stats)

### Opportunities for BrewedAt
- **Dual audience** (B2B + B2C) is unique
- **Gen Z angle** is differentiator
- **Event network access** is valuable add-on
- **Local focus** is strength for regional brands

---

## Appendix B: Sample Layouts

### /business Hero Section
```
┌────────────────────────────────────────┐
│  [Background: Podcast/Brewery Photo]   │
│                                        │
│     Partner with BrewedAt              │
│     Reach the Craft Beverage Community │
│                                        │
│     [Brief mission statement]          │
│                                        │
│  [View Packages] [Contact Us]          │
└────────────────────────────────────────┘
```

### Package Comparison Grid
```
┌──────────┬──────────┬──────────┬──────────┐
│ FLIGHT   │  PINT    │ GROWLER  │   KEG    │
│ $1K/mo   │ $2.2K/mo │ $4.5K/mo │ $8.5K/mo │
│          │          │          │          │
│ • 24 eps │ • 24 eps │ • 38 eps │ • 52 eps │
│ • Social │ • Social │ • Social │ • Social │
│ • Events │ • 2 evts │ • 4 evts │ • 4 evts │
│          │          │          │ • Studio │
│ [Learn]  │ [Learn]  │ [Learn]  │ [Learn]  │
└──────────┴──────────┴──────────┴──────────┘
```

### Stats Grid
```
┌─────────┬─────────┬─────────┬─────────┐
│  1.8M   │  10K+   │  765+   │  1.2K+  │
│ Podcast │ Social  │ Brewery │ Brewery │
│  Views  │Followers│ Owners  │ Visits  │
└─────────┴─────────┴─────────┴─────────┘
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
**Author**: Claude (AI Assistant)
**Approved By**: [Pending]
