import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PackageCard from '../components/business/PackageCard';
import MetricCard from '../components/business/MetricCard';
import ContactForm from '../components/business/ContactForm';
import { apiClient } from '@shared/api-client';

type AudienceType = 'brewery' | 'brand' | 'sponsor' | null;

export default function ForBusinessPage() {
  const [showContactForm, setShowContactForm] = useState(false);

  const handleContactSubmit = async (formData: any) => {
    // Submit contact form via API
    await apiClient.submitContact({
      name: formData.contactName || formData.companyName,
      email: formData.email,
      message: formData.message || `Business Type: ${formData.businessType}\nInterests: ${formData.interests.join(', ')}\nBudget: ${formData.budgetRange}`,
      audienceType: formData.businessType
    });
  };
  const [audienceType, setAudienceType] = useState<AudienceType>(null);
  const [showModal, setShowModal] = useState(true);

  const handleAudienceSelection = (type: AudienceType) => {
    setAudienceType(type);
    setShowModal(false);
  };

  const packages = [
    {
      name: 'Flight',
      price: '$1,000',
      icon: '□',
      features: [
        '24 Podcast Episodes (2/month)',
        '30-second ad reads',
        'Social media mentions',
        'Crafted In Philly & NJ inclusion',
        'Can Art Bracket tournament',
        'Bi-weekly industry stories'
      ]
    },
    {
      name: 'Pint',
      price: '$2,187',
      icon: '▢',
      badge: 'Popular',
      highlighted: true,
      features: [
        'Everything in Flight, plus:',
        '2 Event sponsorships managed',
        '2 Paid partnership videos/month',
        'Swag boxes to breweries',
        'Event wrap-up features'
      ]
    },
    {
      name: 'Growler',
      price: '$4,500',
      icon: '▣',
      features: [
        '38 Podcast Episodes (3/month)',
        '4 Event sponsorships managed',
        '4 Paid partnership videos/month',
        'Weekly industry stories',
        'Studio taping invites (2x)',
        'Quarterly branded posts'
      ]
    },
    {
      name: 'Keg',
      price: '$8,500',
      icon: '◈',
      badge: 'Premium',
      features: [
        '52 Podcast Episodes (4/month)',
        'Official Studio Sponsor status',
        'Logo on podcast cover',
        '8 Paid partnership videos/month',
        '4 Large event sponsorships',
        '200 branded t-shirts for breweries',
        'Studio taping invites (4x)'
      ]
    }
  ];

  const metrics = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="20" x2="12" y2="10"/>
          <line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
      ),
      value: '1.8M',
      label: 'Podcast Views',
      sublabel: 'All-time across platforms'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      value: '10K+',
      label: 'Social Followers',
      sublabel: '5.3M+ total views'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      value: '765+',
      label: 'Brewery Professionals',
      sublabel: 'Owners & staff following'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      ),
      value: '85%',
      label: 'Gen Z & Millennials',
      sublabel: 'Target demographic'
    }
  ];

  const valueProps = [
    {
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      ),
      title: 'Direct Access to Decision-Makers',
      description: '765+ brewery owners and staff follow our content. Reach the people who make purchasing decisions through podcast sponsorships, swag boxes, and brewery-targeted social features.'
    },
    {
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      ),
      title: 'Multi-Channel Reach',
      description: 'Don\'t choose between podcast, social, or events. Our retainers combine all three for maximum impact across the craft beverage community.'
    },
    {
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      title: 'Gen Z Expertise',
      description: 'As a Gen Z-owned company, we authentically connect with the next generation of craft beer drinkers. We don\'t just market to them—we are them.'
    }
  ];

  const partners = {
    local: [
      { name: 'Yards Brewing', initial: 'Y' },
      { name: 'Wissahickon Brewing', initial: 'W' },
      { name: 'Evil Genius Beer Company', initial: 'EG' },
      { name: 'Shackamaxon Brewing', initial: 'S' },
      { name: 'Philly Beer Week', initial: 'PBW' }
    ],
    national: [
      { name: 'GitLab', initial: 'GL' },
      { name: 'BrewLogix', initial: 'BL' },
      { name: 'Goose Island', initial: 'GI' },
      { name: 'Weyerbacher Brewing', initial: 'W' },
      { name: 'Neshaminy Creek', initial: 'NC' }
    ],
    affiliates: [
      { name: 'Craft Beer Professionals', initial: 'CBP' },
      { name: 'Home Brewed Events', initial: 'HBE' },
      { name: 'Brewers of Pennsylvania', initial: 'BOP' },
      { name: 'Brewers Guild of New Jersey', initial: 'BGNJ' }
    ]
  };

  const scrollToContact = () => {
    setShowContactForm(true);
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <Helmet>
        <title>Partner with BrewedAt | Craft Beer Marketing & Sponsorships</title>
        <meta name="description" content="Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network. Flexible retainer packages starting at $1,000/month." />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chrispeterkins.com/brewedat/for-business" />
        <meta property="og:title" content="Partner with BrewedAt | Craft Beer Marketing & Sponsorships" />
        <meta property="og:description" content="Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network. Retainer packages starting at $1,000/month." />
        <meta property="og:image" content="https://chrispeterkins.com/brewedat/beer-background-optimized.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://chrispeterkins.com/brewedat/for-business" />
        <meta name="twitter:title" content="Partner with BrewedAt | Craft Beer Marketing" />
        <meta name="twitter:description" content="Reach 10K+ craft beer enthusiasts and 765+ brewery decision-makers. Retainer packages starting at $1,000/month." />
        <meta name="twitter:image" content="https://chrispeterkins.com/brewedat/beer-background-optimized.jpg" />
      </Helmet>

      {/* Audience Selection Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div style={{
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px 40px',
              maxWidth: '900px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#1f3540',
                marginBottom: '1rem'
              }}>
                Let's Get Started
              </h2>
              <p style={{
                fontSize: '1.125rem',
                color: '#5a6c7d',
                lineHeight: '1.6'
              }}>
                Tell us more about your business so we can show you the right partnership opportunities
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Brewery/Venue Option */}
              <button
                onClick={() => handleAudienceSelection('brewery')}
                style={{
                  padding: '28px 24px',
                  textAlign: 'center',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fd5526';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(253, 85, 38, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #fd5526 0%, #e04515 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  flexShrink: 0
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M3 13h18M3 17h18M8 21h8M5 3v4M19 3v4M9 3h6"/>
                    <rect x="4" y="7" width="16" height="6" rx="1"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f3540',
                  margin: 0
                }}>
                  Brewery or Taproom
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Partner with us to amplify your taproom events and reach craft beer enthusiasts
                </p>
              </button>

              {/* Industry/Product Brand Option */}
              <button
                onClick={() => handleAudienceSelection('brand')}
                style={{
                  padding: '28px 24px',
                  textAlign: 'center',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fd5526';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(253, 85, 38, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #fd5526 0%, #e04515 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  flexShrink: 0
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f3540',
                  margin: 0
                }}>
                  Industry Product/Service
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Connect your brewing equipment, ingredients, or services with our brewery network
                </p>
              </button>

              {/* Event/Marketing Sponsor Option */}
              <button
                onClick={() => handleAudienceSelection('sponsor')}
                style={{
                  padding: '28px 24px',
                  textAlign: 'center',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fd5526';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(253, 85, 38, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #fd5526 0%, #e04515 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  flexShrink: 0
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f3540',
                  margin: 0
                }}>
                  Marketing & Visibility
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Reach craft beer fans through our podcast, events, and social media channels
                </p>
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Render content based on audience type */}
      {audienceType === 'brand' && (
      <div>
        {/* Hero Section */}
        <section style={{
        padding: '140px 20px 80px',
        backgroundImage: 'linear-gradient(rgba(31, 53, 64, 0.85), rgba(37, 48, 61, 0.85)), url(/brewedat/beer-background-optimized.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            Partner with BrewedAt
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#e8edf2',
            marginBottom: '2.5rem',
            lineHeight: '1.8',
            maxWidth: '750px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Bridge the gap between today's beer landscape and Gen Z consumers. Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#packages"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: '#fd5526',
                color: 'white',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(253, 85, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View Retainer Packages
            </a>
            <button
              onClick={scrollToContact}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#1f3540';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section style={{
        padding: '80px 0',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1f3540',
              marginBottom: '1rem'
            }}>
              By The Numbers
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#25303d' }}>
              Our reach across the craft beverage community
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section style={{
        padding: '80px 0',
        background: '#fef5e7'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1f3540',
              marginBottom: '1rem'
            }}>
              Why Partner with BrewedAt?
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#25303d', maxWidth: '700px', margin: '0 auto' }}>
              As a Gen Z-owned company, we understand how to turn generational trends into real connections
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px'
          }}>
            {valueProps.map((prop, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '40px 32px',
                borderRadius: '16px',
                border: '2px solid #E0E0E0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#fd5526';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E0E0E0';
              }}
              >
                <div style={{ marginBottom: '20px', textAlign: 'center', color: '#fd5526', display: 'flex', justifyContent: 'center' }}>
                  {prop.icon}
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#1f3540',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  {prop.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#25303d',
                  lineHeight: '1.7',
                  textAlign: 'center'
                }}>
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Retainer Packages */}
      <section id="packages" style={{
        padding: '100px 0',
        background: 'linear-gradient(135deg, #1f3540 0%, #25303d 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '1rem'
            }}>
              Choose Your Partnership Level
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#b8c5d0',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Flexible retainer packages designed to fit your marketing goals and budget
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
            marginBottom: '60px'
          }}>
            {packages.map((pkg, index) => (
              <PackageCard
                key={index}
                {...pkg}
                onLearnMore={scrollToContact}
              />
            ))}
          </div>
          <div style={{
            background: 'rgba(254, 245, 231, 0.15)',
            padding: '32px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid rgba(253, 85, 38, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
              Need a Custom Package?
            </h3>
            <p style={{ fontSize: '16px', color: '#b8c5d0', marginBottom: '16px' }}>
              We can create a tailored solution that fits your specific needs and budget
            </p>
            <button
              onClick={scrollToContact}
              style={{
                padding: '12px 28px',
                background: '#fd5526',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = '#e04515';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = '#fd5526';
              }}
            >
              Let's Talk
            </button>
          </div>
        </div>
      </section>

      {/* What's Included Overview */}
      <section style={{
        padding: '80px 0',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1f3540',
              marginBottom: '1rem'
            }}>
              What's Included in Every Retainer
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                title: 'Monthly Performance Reports',
                description: 'Detailed analytics on podcast downloads, social media reach, and engagement metrics'
              },
              {
                title: 'Quarterly Review Calls',
                description: 'Strategic sessions to assess campaign results and optimize your partnership'
              },
              {
                title: 'Priority Event Access',
                description: 'First dibs on new BrewedAt events and partnership opportunities'
              },
              {
                title: 'Dedicated Support',
                description: 'Direct line to Evan & Cole for questions, requests, and strategic guidance'
              }
            ].map((item, index) => (
              <div key={index} style={{
                background: '#fef5e7',
                padding: '32px',
                borderRadius: '12px',
                border: '2px solid #E0E0E0'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f3540',
                  marginBottom: '12px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#25303d',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Partners */}
      <section style={{
        padding: '80px 0',
        background: '#fef5e7'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1f3540',
              marginBottom: '1rem'
            }}>
              Notable Partners
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#25303d' }}>
              Past and present partners across the craft beverage industry
            </p>
          </div>

          {/* Local Partners */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f3540',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'center'
            }}>
              Local Partners
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px'
            }}>
              {partners.local.map((partner, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '32px 24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #E0E0E0',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  minHeight: '140px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#fd5526';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(253, 85, 38, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E0E0E0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #fd5526 0%, #e04515 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '700',
                    letterSpacing: '-1px'
                  }}>
                    {partner.initial}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1f3540',
                    lineHeight: '1.3'
                  }}>
                    {partner.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* National Partners */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f3540',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'center'
            }}>
              National Partners
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px'
            }}>
              {partners.national.map((partner, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '32px 24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #E0E0E0',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  minHeight: '140px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#fd5526';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(253, 85, 38, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E0E0E0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1f3540 0%, #25303d 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '700',
                    letterSpacing: '-1px'
                  }}>
                    {partner.initial}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1f3540',
                    lineHeight: '1.3'
                  }}>
                    {partner.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affiliate Organizations */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f3540',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'center'
            }}>
              Affiliate Organizations
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {partners.affiliates.map((partner, index) => (
                <div key={index} style={{
                  background: '#fef5e7',
                  padding: '24px 20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #E0E0E0',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#fd5526';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(253, 85, 38, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E0E0E0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#fd5526',
                    letterSpacing: '1px'
                  }}>
                    {partner.initial}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f3540',
                    lineHeight: '1.3'
                  }}>
                    {partner.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      {showContactForm && (
        <section id="contact" style={{
          padding: '100px 0',
          background: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: '800',
                color: '#1f3540',
                marginBottom: '1rem'
              }}>
                Let's Build a Partnership
              </h2>
              <p style={{
                fontSize: '1.125rem',
                color: '#25303d',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                Tell us about your goals and we'll create a custom proposal for your brand
              </p>
            </div>
            <ContactForm onSubmit={handleContactSubmit} />
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{
        padding: '80px 0',
        background: '#1f3540'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '1rem'
          }}>
            Ready to Tap Into Our Network?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#b8c5d0',
            marginBottom: '2rem',
            lineHeight: '1.8'
          }}>
            Join leading brands in reaching craft beverage enthusiasts and industry decision-makers across Pennsylvania and New Jersey
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={scrollToContact}
              style={{
                padding: '16px 32px',
                background: '#fd5526',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(253, 85, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Get Started
            </button>
            <a
              href="mailto:info@brewedat.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '16px 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#1f3540';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Email Us
            </a>
          </div>
          <p style={{
            marginTop: '2rem',
            fontSize: '16px',
            color: '#b8c5d0'
          }}>
            Questions? Contact Evan Blum at <a href="tel:267-315-4513" style={{ color: '#fd5526', textDecoration: 'none', fontWeight: '600' }}>267-315-4513</a> or Cole Decker at <a href="tel:215-478-2363" style={{ color: '#fd5526', textDecoration: 'none', fontWeight: '600' }}>215-478-2363</a>
          </p>
        </div>
      </section>
      </div>
      )}

      {/* Brewery Content - Placeholder */}
      {audienceType === 'brewery' && (
      <div>
        {/* Hero Section */}
        <section style={{
          padding: '140px 20px 80px',
          backgroundImage: 'linear-gradient(rgba(31, 53, 64, 0.85), rgba(37, 48, 61, 0.85)), url(/brewedat/beer-background-optimized.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '1.5rem',
              lineHeight: '1.2'
            }}>
              Partner with BrewedAt
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#e8edf2',
              marginBottom: '2.5rem',
              lineHeight: '1.8',
              maxWidth: '750px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Exclusive brewery partnership opportunities coming soon. We're building something special for breweries like yours.
            </p>
          </div>
        </section>

        {/* Placeholder Content */}
        <section style={{ padding: '100px 20px', background: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 2rem',
              background: 'linear-gradient(135deg, #fd5526 0%, #e04515 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1f3540',
              marginBottom: '1.5rem'
            }}>
              Brewery Partnerships Coming Soon
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#5a6c7d',
              marginBottom: '2.5rem',
              lineHeight: '1.8'
            }}>
              We're developing exclusive partnership packages specifically designed for breweries. From podcast features to event collaborations and social media spotlights, we're creating opportunities to amplify your brand and connect with your community.
            </p>
            <div style={{
              background: '#f9fafb',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '2.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f3540',
                marginBottom: '1rem'
              }}>
                Interested in partnering?
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#5a6c7d',
                marginBottom: '1.5rem'
              }}>
                Contact us to learn more about upcoming brewery partnership opportunities.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="mailto:info@brewedat.com" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: '#fd5526',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}>
                  Contact Us
                </a>
                <button
                  onClick={() => handleAudienceSelection(null)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 32px',
                    background: 'white',
                    color: '#1f3540',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Back to Selection
                </button>
              </div>
            </div>
            <p style={{
              fontSize: '0.9rem',
              color: '#7a8a9a'
            }}>
              Questions? Contact Evan Blum at <a href="tel:267-315-4513" style={{ color: '#fd5526', textDecoration: 'none', fontWeight: '600' }}>267-315-4513</a> or Cole Decker at <a href="tel:215-478-2363" style={{ color: '#fd5526', textDecoration: 'none', fontWeight: '600' }}>215-478-2363</a>
            </p>
          </div>
        </section>
      </div>
      )}

      {/* Sponsor/Marketing Content - Show existing brand page */}
      {audienceType === 'sponsor' && (
      <div>
        {/* Hero Section */}
        <section style={{
        padding: '140px 20px 80px',
        backgroundImage: 'linear-gradient(rgba(31, 53, 64, 0.85), rgba(37, 48, 61, 0.85)), url(/brewedat/beer-background-optimized.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            Partner with BrewedAt
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#e8edf2',
            marginBottom: '2.5rem',
            lineHeight: '1.8',
            maxWidth: '750px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Bridge the gap between today's beer landscape and Gen Z consumers. Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#packages"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: '#fd5526',
                color: 'white',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(253, 85, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View Retainer Packages
            </a>
            <button
              onClick={scrollToContact}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#1f3540';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
      {/* Rest of sponsor content - show all the existing brand page sections */}
      <p style={{ textAlign: 'center', padding: '40px 20px', fontSize: '1rem', color: '#5a6c7d' }}>
        Marketing & sponsorship packages content here. This will show the full retainer packages and metrics.
        <br /><br />
        <button
          onClick={() => handleAudienceSelection(null)}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#1f3540',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Back to Selection
        </button>
      </p>
      </div>
      )}
    </>
  );
}
