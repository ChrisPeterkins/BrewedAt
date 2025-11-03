import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/podcast', label: 'Podcast' },
    { path: '/press', label: 'Press' },
    { path: '/for-business', label: 'Partner With Us' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <img
            src="/brewedat/brewedat-logo.png"
            alt="BrewedAt Logo"
            style={styles.logoImg}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop-links" style={styles.desktopLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) ? styles.navLinkActive : {})
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/get-involved" style={styles.ctaButton}>
            Contact Us
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="nav-mobile-button"
          style={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={styles.mobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/get-involved"
            style={styles.mobileCtaButton}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoImg: {
    height: '40px',
    width: 'auto',
  },
  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  navLink: {
    color: '#1f3540',
    fontSize: '15px',
    fontWeight: '500' as const,
    textDecoration: 'none',
    transition: 'color 0.2s',
    padding: '8px 0',
    borderBottom: '2px solid transparent',
  },
  navLinkActive: {
    color: 'var(--color-secondary)',
    borderBottomColor: 'var(--color-secondary)',
  },
  ctaButton: {
    backgroundColor: 'var(--color-secondary)',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  mobileMenuButton: {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#1f3540',
    padding: '8px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  mobileLink: {
    color: '#1f3540',
    fontSize: '16px',
    fontWeight: '500' as const,
    padding: '12px 0',
    textDecoration: 'none',
    borderBottom: '1px solid #E0E0E0',
  },
  mobileCtaButton: {
    backgroundColor: 'var(--color-secondary)',
    color: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    marginTop: '8px',
  },
};

// Add media query styles
const mediaQueryStyles = `
  @media (max-width: 768px) {
    .nav-desktop-links {
      display: none !important;
    }
    .nav-mobile-button {
      display: block !important;
    }
  }

  @media (min-width: 769px) {
    .nav-mobile-button {
      display: none !important;
    }
  }
`;

// Inject styles only once
if (typeof document !== 'undefined' && !document.getElementById('nav-responsive-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'nav-responsive-styles';
  styleElement.textContent = mediaQueryStyles;
  document.head.appendChild(styleElement);
}
