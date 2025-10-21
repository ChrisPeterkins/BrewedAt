import { useState } from 'react';

interface OverlayConfig {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  backdropFilter: string;
  boxShadow?: string;
}

const overlayConfigs: OverlayConfig[] = [
  {
    id: 'subtle-blur',
    name: 'Subtle Blur',
    description: 'Light overlay, strong image visibility',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(4px) saturate(120%)',
  },
  {
    id: 'medium-blur',
    name: 'Medium Blur',
    description: 'Balanced overlay and image',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(8px) saturate(120%)',
  },
  {
    id: 'strong-blur',
    name: 'Strong Blur',
    description: 'Heavy blur, softer image',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px) saturate(130%)',
  },
  {
    id: 'dark-tint',
    name: 'Dark Tint',
    description: 'Subtle dark overlay for contrast',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(6px) saturate(140%)',
  },
  {
    id: 'warm-glow',
    name: 'Warm Glow',
    description: 'Warm amber overlay',
    backgroundColor: 'rgba(253, 85, 38, 0.15)',
    backdropFilter: 'blur(8px) saturate(150%) brightness(110%)',
  },
  {
    id: 'cool-frost',
    name: 'Cool Frost',
    description: 'Blue-tinted frosted effect',
    backgroundColor: 'rgba(31, 53, 64, 0.25)',
    backdropFilter: 'blur(10px) saturate(130%)',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Very light, maximum image visibility',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(2px)',
  },
  {
    id: 'gradient-white',
    name: 'Gradient White',
    description: 'Gradient overlay from white to light gray',
    backgroundColor: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(245, 245, 245, 0.6) 100%)',
    backdropFilter: 'blur(6px) saturate(120%)',
  },
  {
    id: 'gradient-warm',
    name: 'Gradient Warm',
    description: 'Warm gradient overlay',
    backgroundColor: 'linear-gradient(135deg, rgba(253, 85, 38, 0.2) 0%, rgba(255, 255, 255, 0.6) 100%)',
    backdropFilter: 'blur(8px) saturate(140%)',
  },
  {
    id: 'crisp',
    name: 'Crisp & Clear',
    description: 'Sharp image with light overlay',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(3px) saturate(150%) contrast(110%)',
  },
];

export default function HeroOverlayPicker() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<OverlayConfig>(overlayConfigs[0]);

  const applyOverlay = (config: OverlayConfig) => {
    setCurrentConfig(config);

    // Remove existing override if any
    const existing = document.getElementById('hero-overlay-override');
    if (existing) existing.remove();

    // Create new style element
    const style = document.createElement('style');
    style.id = 'hero-overlay-override';

    style.textContent = `
      .hero::before {
        background: ${config.backgroundColor} !important;
        backdrop-filter: ${config.backdropFilter} !important;
        -webkit-backdrop-filter: ${config.backdropFilter} !important;
        ${config.boxShadow ? `box-shadow: ${config.boxShadow} !important;` : ''}
      }
    `;
    document.head.appendChild(style);
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={styles.toggleButton}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        {isExpanded ? 'Hide' : 'Try'} Overlay Styles
      </button>

      {isExpanded && (
        <div style={styles.pickerPanel}>
          <h3 style={styles.title}>Hero Background Overlay</h3>
          <p style={styles.subtitle}>
            Click an option to preview the overlay effect on your hero section
          </p>

          <div style={styles.grid}>
            {overlayConfigs.map((config) => (
              <button
                key={config.id}
                onClick={() => applyOverlay(config)}
                style={{
                  ...styles.configCard,
                  ...(currentConfig.id === config.id ? styles.configCardActive : {}),
                }}
              >
                <div style={styles.configName}>{config.name}</div>
                <div style={styles.configDescription}>{config.description}</div>
                <div style={styles.preview}>
                  <div
                    style={{
                      width: '100%',
                      height: '40px',
                      background: config.backgroundColor,
                      backdropFilter: config.backdropFilter,
                      WebkitBackdropFilter: config.backdropFilter,
                      borderRadius: '4px',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
                {currentConfig.id === config.id && (
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
    bottom: '90px',
    right: '24px',
    zIndex: 9998,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#1f3540',
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
    width: '500px',
    maxHeight: '70vh',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    overflowY: 'auto' as const,
    border: '1px solid #E0E0E0',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700' as const,
    color: '#1f3540',
    marginBottom: '8px',
    marginTop: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#25303d',
    marginBottom: '20px',
    marginTop: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  configCard: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    padding: '16px',
    backgroundColor: '#FAFAF8',
    border: '2px solid #E0E0E0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
    width: '100%',
  },
  configCardActive: {
    borderColor: '#fd5526',
    backgroundColor: '#FFFFFF',
  },
  configName: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#1f3540',
    marginBottom: '4px',
  },
  configDescription: {
    fontSize: '11px',
    color: '#25303d',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  preview: {
    width: '100%',
    marginTop: '8px',
  },
  activeIndicator: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#fd5526',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600' as const,
  },
};
