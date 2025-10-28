export default function HallOfChampionsPage() {
  return (
    <div>
      <section style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>Hall of Champions</h1>
          <p style={styles.subtitle}>
            Celebrating the legends of our gaming tournaments
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.championsGrid}>
            <div style={styles.championCard}>
              <div style={styles.icon}>🏎️</div>
              <h3 style={styles.gameTitle}>Mario Kart</h3>
              <div style={styles.platform}>Nintendo Switch</div>
              <p style={styles.description}>
                64-player tournaments in 150cc. Speed, strategy, and a little bit of chaos.
              </p>
              <div style={styles.placeholder}>
                <div style={styles.trophy}>🏆</div>
                <p>Champions TBA</p>
              </div>
            </div>

            <div style={styles.championCard}>
              <div style={styles.icon}>🎮</div>
              <h3 style={styles.gameTitle}>Super Smash Bros. Ultimate</h3>
              <div style={styles.platform}>Nintendo Switch</div>
              <p style={styles.description}>
                Intense 64-player brackets. 3-stock, no items, pure skill.
              </p>
              <div style={styles.placeholder}>
                <div style={styles.trophy}>🏆</div>
                <p>Champions TBA</p>
              </div>
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
  championsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' },
  championCard: { backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' as const },
  icon: { fontSize: '64px', marginBottom: '16px' },
  gameTitle: { fontSize: '24px', fontWeight: '600' as const, color: '#1f3540', marginBottom: '8px' },
  platform: { fontSize: '13px', color: '#fd5526', marginBottom: '16px', fontWeight: '600' as const, textTransform: 'uppercase' as const },
  description: { fontSize: '15px', color: '#666', marginBottom: '24px', lineHeight: '1.6' },
  placeholder: { backgroundColor: '#fef5e7', padding: '32px', borderRadius: '8px' },
  trophy: { fontSize: '48px', marginBottom: '8px' },
};
