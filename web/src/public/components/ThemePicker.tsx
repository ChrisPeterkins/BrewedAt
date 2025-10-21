import { useState } from 'react';
import { themes } from '../themes';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemePicker() {
  const { currentTheme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={styles.toggleButton}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
        </svg>
        {isExpanded ? 'Hide' : 'Try'} Theme Picker
      </button>

      {isExpanded && (
        <div style={styles.pickerPanel}>
          <h3 style={styles.title}>Choose a Theme</h3>
          <p style={styles.subtitle}>
            Click a theme to preview it. Your selection will be saved.
          </p>

          <div style={styles.grid}>
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme)}
                style={{
                  ...styles.themeCard,
                  ...(currentTheme.id === theme.id ? styles.themeCardActive : {}),
                }}
              >
                <div style={styles.colorSwatches}>
                  <div style={{ ...styles.swatch, backgroundColor: theme.colors.primary }} />
                  <div style={{ ...styles.swatch, backgroundColor: theme.colors.secondary }} />
                  <div style={{ ...styles.swatch, backgroundColor: theme.colors.tertiary }} />
                </div>
                <h4 style={styles.themeName}>{theme.name}</h4>
                <p style={styles.themeDescription}>{theme.description}</p>
                <div style={styles.fontPreview}>
                  <span style={{ fontFamily: theme.fontFamily }}>Aa</span>
                  <span style={styles.fontName}>{theme.fontFamily.split(',')[0]}</span>
                </div>
                {currentTheme.id === theme.id && (
                  <div style={styles.activeIndicator}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Active
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'var(--color-secondary, #D4922A)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
  },
  pickerPanel: {
    position: 'absolute' as const,
    bottom: '60px',
    right: '0',
    width: '420px',
    maxHeight: '70vh',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    overflowY: 'auto' as const,
    border: '1px solid var(--color-border, #E0E0E0)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700' as const,
    color: 'var(--color-text, #654321)',
    marginBottom: '8px',
    marginTop: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--color-text-secondary, #8B4513)',
    marginBottom: '20px',
    marginTop: 0,
  },
  grid: {
    display: 'grid',
    gap: '12px',
  },
  themeCard: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    padding: '16px',
    backgroundColor: 'var(--color-background, #FAFAF8)',
    border: '2px solid var(--color-border, #E0E0E0)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
    width: '100%',
  },
  themeCardActive: {
    borderColor: 'var(--color-secondary, #D4922A)',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
  },
  colorSwatches: {
    display: 'flex',
    gap: '6px',
    marginBottom: '12px',
  },
  swatch: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  themeName: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: 'var(--color-text, #654321)',
    margin: '0 0 6px 0',
  },
  themeDescription: {
    fontSize: '12px',
    color: 'var(--color-text-secondary, #8B4513)',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  fontPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--color-border, #E0E0E0)',
    width: '100%',
  },
  fontName: {
    fontSize: '11px',
    color: 'var(--color-text-secondary, #8B4513)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  activeIndicator: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: 'var(--color-secondary, #D4922A)',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600' as const,
  },
};
