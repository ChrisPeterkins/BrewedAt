export default function ForBusinessPage() {
  const partners = [
    "Victory Brewing", "Neshaminy Creek", "Love City Brewing", "Punch Buggy Brewing",
    "Forgotten Boardwalk", "Space Cadet Brewing", "New Ridge Brewing", "Urban Village",
    "Chestnut Hill Brewing", "Mainstay Independent Brewing", "2SP Brewing", "Evil Genius",
    "Yards Brewing", "Free Will Brewing", "Dock Street Brewery", "Wissahickon Brewing"
  ];

  const assets = [
    {
      title: "The BrewedAt Podcast",
      stat: "60+ Episodes",
      description: "In-depth conversations with brewery owners, bar operators, and industry leaders across PA & NJ"
    },
    {
      title: "Social Media Network",
      stat: "15K+ Followers",
      description: "Engaged craft beer enthusiasts across Instagram, Facebook, TikTok, and YouTube"
    },
    {
      title: "Live Events",
      stat: "Year-Round",
      description: "Gaming tournaments, brewery tours, and community gatherings that bring people together"
    },
    {
      title: "Content Creation",
      stat: "Professional",
      description: "High-quality photography, videography, and storytelling for the craft beer community"
    }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Tap into the BrewedAt Network</h1>
          <p style={styles.subtitle}>
            Connect with the craft beer community through our multi-platform ecosystem
          </p>
          <div style={styles.buttonGroup}>
            <a href="#case-studies" style={styles.primaryButton}>
              Case Studies
            </a>
            <a href="#contact" style={styles.secondaryButton}>
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* BrewedAt Assets */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>What We Offer</h2>
          <p style={styles.sectionSubtitle}>
            Leverage our ecosystem to reach your target audience
          </p>
          <div style={styles.assetsGrid}>
            {assets.map((asset, index) => (
              <div key={index} style={styles.assetCard}>
                <div style={styles.assetStat}>{asset.stat}</div>
                <h3 style={styles.assetTitle}>{asset.title}</h3>
                <p style={styles.assetDesc}>{asset.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section style={styles.partnersSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Our Partners</h2>
          <p style={styles.sectionSubtitle}>
            Proud to work with amazing breweries across Pennsylvania and New Jersey
          </p>
          <div style={styles.partnersGrid}>
            {partners.map((partner, index) => (
              <div key={index} style={styles.partnerCard}>
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Ready to Partner?</h2>
            <p style={styles.ctaText}>Let's discuss how we can help grow your brand</p>
            <a href="mailto:contact@brewedat.com" style={styles.ctaButton}>
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    backgroundColor: '#fef5e7',
    padding: '100px 0 80px',
    textAlign: 'center' as const
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    overflow: 'hidden' as const
  },
  title: {
    fontSize: 'clamp(36px, 5vw, 56px)',
    fontWeight: '800' as const,
    color: '#1f3540',
    marginBottom: '16px',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '20px',
    color: '#25303d',
    maxWidth: '700px',
    margin: '0 auto 32px',
    lineHeight: '1.6'
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const
  },
  primaryButton: {
    display: 'inline-block',
    padding: '16px 40px',
    backgroundColor: '#fd5526',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  secondaryButton: {
    display: 'inline-block',
    padding: '16px 40px',
    backgroundColor: 'transparent',
    color: '#1f3540',
    border: '2px solid #1f3540',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  section: {
    padding: '80px 0',
    backgroundColor: '#FFFFFF'
  },
  sectionTitle: {
    fontSize: '40px',
    fontWeight: '700' as const,
    color: '#1f3540',
    marginBottom: '12px',
    textAlign: 'center' as const
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: '#25303d',
    textAlign: 'center' as const,
    marginBottom: '48px',
    maxWidth: '600px',
    margin: '0 auto 48px'
  },
  assetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    marginTop: '48px'
  },
  assetCard: {
    backgroundColor: '#FFFFFF',
    padding: '40px 32px',
    borderRadius: '16px',
    border: '2px solid #E0E0E0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  assetStat: {
    fontSize: '28px',
    fontWeight: '700' as const,
    color: '#fd5526',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  assetTitle: {
    fontSize: '22px',
    fontWeight: '600' as const,
    color: '#1f3540',
    marginBottom: '12px',
    lineHeight: '1.3'
  },
  assetDesc: {
    fontSize: '15px',
    color: '#25303d',
    lineHeight: '1.7'
  },
  partnersSection: {
    padding: '80px 0',
    backgroundColor: '#f5f5f5'
  },
  partnersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontSize: '16px',
    fontWeight: '500' as const,
    color: '#1f3540',
    border: '1px solid #E0E0E0',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  ctaSection: {
    padding: '80px 0',
    backgroundColor: '#FFFFFF'
  },
  cta: {
    backgroundColor: '#1f3540',
    padding: '60px 32px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    maxWidth: '100%',
    boxSizing: 'border-box' as const
  },
  ctaTitle: {
    fontSize: '36px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: '12px'
  },
  ctaText: {
    fontSize: '18px',
    color: '#b8c5d0',
    marginBottom: '24px'
  },
  ctaButton: {
    display: 'inline-block',
    padding: '16px 40px',
    backgroundColor: '#fd5526',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    transition: 'transform 0.2s'
  },
};
