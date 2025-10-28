export default function PressPage() {
  return (
    <div>
      <section style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>Press & Media</h1>
          <p style={styles.subtitle}>
            BrewedAt in the news
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.pressGrid}>
            <div style={styles.pressCard}>
              <h3 style={styles.pressTitle}>Temple grads introduce Philly craft beer scene to new generation with BrewedAt</h3>
              <p style={styles.pressExcerpt}>
                Evan Blum and Cole Decker, Bucks County natives and Temple University graduates, launched BrewedAt last year.
              </p>
              <a href="#" style={styles.readMore}>Read on PhillyVoice →</a>
            </div>

            <div style={styles.pressCard}>
              <h3 style={styles.pressTitle}>BrewedAt launches to promote Philly-area craft beer scene</h3>
              <p style={styles.pressExcerpt}>
                Digital and media production company uses social media and events to connect casual drinkers with local craft breweries.
              </p>
              <a href="#" style={styles.readMore}>Read More →</a>
            </div>

            <div style={styles.pressCard}>
              <h3 style={styles.pressTitle}>Crafted in Philly Brewery Crawl</h3>
              <p style={styles.pressExcerpt}>
                11 Philadelphia Breweries offer a Free Pour at their Taprooms. This 2-Month Long event runs from April 26 until June 30, 2024.
              </p>
              <a href="#" style={styles.readMore}>Watch on PHL17 →</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  header: { backgroundColor: '#fef5e7', padding: '60px 0', textAlign: 'center' as const },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  title: { fontSize: '42px', fontWeight: '700' as const, color: '#1f3540', marginBottom: '16px' },
  subtitle: { fontSize: '18px', color: '#25303d' },
  section: { padding: '60px 0' },
  pressGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  pressCard: { backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  pressTitle: { fontSize: '20px', fontWeight: '600' as const, color: '#1f3540', marginBottom: '12px' },
  pressExcerpt: { fontSize: '15px', color: '#666', marginBottom: '16px', lineHeight: '1.6' },
  readMore: { color: '#fd5526', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none' },
};
