export default function ForBusinessPage() {
  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Partner With BrewedAt</h1>
          <p style={styles.subtitle}>
            Reach the craft beer community through events, content, and marketing campaigns
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.servicesGrid}>
            <div style={styles.service}>
              <div style={styles.icon}>📅</div>
              <h3 style={styles.serviceTitle}>Events</h3>
              <p style={styles.serviceDesc}>
                We create unforgettable beer events that bring your brewery and the community together.
              </p>
            </div>

            <div style={styles.service}>
              <div style={styles.icon}>📱</div>
              <h3 style={styles.serviceTitle}>Social Media</h3>
              <p style={styles.serviceDesc}>
                Amplify your brand with our engaged audience across Instagram, Facebook, and more.
              </p>
            </div>

            <div style={styles.service}>
              <div style={styles.icon}>🎙️</div>
              <h3 style={styles.serviceTitle}>Podcast Features</h3>
              <p style={styles.serviceDesc}>
                Share your story on The BrewedAt Podcast and connect with beer enthusiasts.
              </p>
            </div>

            <div style={styles.service}>
              <div style={styles.icon}>📊</div>
              <h3 style={styles.serviceTitle}>Marketing Campaigns</h3>
              <p style={styles.serviceDesc}>
                Custom campaigns tailored to your brewery's goals and audience.
              </p>
            </div>
          </div>

          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
            <p style={styles.ctaText}>Contact us to discuss partnership opportunities</p>
            <a href="mailto:contact@brewedat.com" style={styles.ctaButton}>
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { backgroundColor: '#FFF3E0', padding: '80px 0', textAlign: 'center' as const },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  title: { fontSize: '48px', fontWeight: '700' as const, color: '#654321', marginBottom: '16px' },
  subtitle: { fontSize: '20px', color: '#8B4513', maxWidth: '700px', margin: '0 auto' },
  section: { padding: '80px 0' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginBottom: '60px' },
  service: { backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' as const },
  icon: { fontSize: '48px', marginBottom: '16px' },
  serviceTitle: { fontSize: '22px', fontWeight: '600' as const, color: '#654321', marginBottom: '12px' },
  serviceDesc: { fontSize: '15px', color: '#666', lineHeight: '1.6' },
  cta: { backgroundColor: '#654321', padding: '60px 32px', borderRadius: '12px', textAlign: 'center' as const },
  ctaTitle: { fontSize: '32px', fontWeight: '700' as const, color: '#FFFFFF', marginBottom: '12px' },
  ctaText: { fontSize: '16px', color: '#D4922A', marginBottom: '24px' },
  ctaButton: { display: 'inline-block', padding: '14px 32px', backgroundColor: '#D4922A', color: '#FFFFFF', borderRadius: '8px', fontSize: '16px', fontWeight: '600' as const, textDecoration: 'none' },
};
