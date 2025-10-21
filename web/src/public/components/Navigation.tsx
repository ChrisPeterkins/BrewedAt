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
            src="/brewedat-logo.png"
            alt="BrewedAt Logo"
            style={styles.logoImg}
          />
        </Link>

        {/* Desktop Navigation */}
        <div style={styles.desktopLinks}>
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
          <Link to="/submit-event" style={styles.ctaButton}>
            Submit Event
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
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
            to="/submit-event"
            style={styles.mobileCtaButton}
            onClick={() => setMobileMenuOpen(false)}
          >
            Submit Event
          </Link>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E0E0E0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
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
    color: '#654321',
    fontSize: '15px',
    fontWeight: '500' as const,
    textDecoration: 'none',
    transition: 'color 0.2s',
    padding: '8px 0',
    borderBottom: '2px solid transparent',
  },
  navLinkActive: {
    color: '#D4922A',
    borderBottomColor: '#D4922A',
  },
  ctaButton: {
    backgroundColor: '#D4922A',
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
    color: '#654321',
    padding: '8px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  mobileLink: {
    color: '#654321',
    fontSize: '16px',
    fontWeight: '500' as const,
    padding: '12px 0',
    textDecoration: 'none',
    borderBottom: '1px solid #F5F5F5',
  },
  mobileCtaButton: {
    backgroundColor: '#D4922A',
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
    nav [style*="desktopLinks"] {
      display: none !important;
    }
    nav button[aria-label="Toggle menu"] {
      display: block !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = mediaQueryStyles;
  document.head.appendChild(styleElement);
}
