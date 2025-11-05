import { useState } from 'react';

interface ContactFormProps {
  onSubmit?: (data: any) => Promise<void>;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    interests: [] as string[],
    budgetRange: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.contactName || !formData.companyName) {
      setFormMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setFormMessage('');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default behavior - simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setFormMessage('Thanks for your interest! We\'ll be in touch within 24 hours.');
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        businessType: '',
        interests: [],
        budgetRange: '',
        message: ''
      });
    } catch (error) {
      setFormMessage('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter(i => i !== value)
        : [...prev.interests, value]
    }));
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Rubik, sans-serif',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const,
    color: '#1f3540',
    fontSize: '15px'
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>
          Company Name <span style={{ color: '#fd5526' }}>*</span>
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={e => setFormData({ ...formData, companyName: e.target.value })}
          style={inputStyle}
          required
          onFocus={(e) => e.currentTarget.style.borderColor = '#fd5526'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>
          Your Name <span style={{ color: '#fd5526' }}>*</span>
        </label>
        <input
          type="text"
          value={formData.contactName}
          onChange={e => setFormData({ ...formData, contactName: e.target.value })}
          style={inputStyle}
          required
          onFocus={(e) => e.currentTarget.style.borderColor = '#fd5526'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>
            Email <span style={{ color: '#fd5526' }}>*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            style={inputStyle}
            required
            onFocus={(e) => e.currentTarget.style.borderColor = '#fd5526'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
          />
        </div>
        <div>
          <label style={labelStyle}>Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = '#fd5526'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Business Type</label>
        <select
          value={formData.businessType}
          onChange={e => setFormData({ ...formData, businessType: e.target.value })}
          style={{...inputStyle, cursor: 'pointer'}}
          onFocus={(e) => e.currentTarget.style.borderColor = '#fd5526'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
        >
          <option value="">Select...</option>
          <option value="supplier">Supplier/Vendor</option>
          <option value="brewery">Brewery</option>
          <option value="brand">Brand/Manufacturer</option>
          <option value="distributor">Distributor</option>
          <option value="agency">Marketing Agency</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Interested In (Check all that apply)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          {['Podcast Sponsorship', 'Social Media Features', 'Event Sponsorships', 'Full Retainer Package'].map(option => (
            <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '15px', color: '#25303d' }}>
              <input
                type="checkbox"
                checked={formData.interests.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fd5526' }}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Budget Range</label>
        <select
          value={formData.budgetRange}
          onChange={e => setFormData({ ...formData, budgetRange: e.target.value })}
          style={{...inputStyle, cursor: 'pointer'}}
          onFocus={(e) => e.currentTarget.style.borderColor = '#fd5526'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
        >
          <option value="">Select...</option>
          <option value="under-1k">Under $1,000/month</option>
          <option value="1k-3k">$1,000 - $3,000/month</option>
          <option value="3k-5k">$3,000 - $5,000/month</option>
          <option value="5k-10k">$5,000 - $10,000/month</option>
          <option value="over-10k">$10,000+/month</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Tell us about your goals</label>
        <textarea
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          rows={5}
          style={{...inputStyle, resize: 'vertical' as const, minHeight: '120px'}}
          placeholder="What are you hoping to achieve with this partnership?"
          onFocus={(e) => e.currentTarget.style.borderColor = '#fd5526'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          padding: '18px 32px',
          background: submitting ? '#ccc' : '#fd5526',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box' as const
        }}
        onMouseEnter={(e) => {
          if (!submitting) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(253, 85, 38, 0.3)';
            e.currentTarget.style.background = '#e04515';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          if (!submitting) {
            e.currentTarget.style.background = '#fd5526';
          }
        }}
      >
        {submitting ? 'Sending...' : 'Get a Custom Quote'}
      </button>

      {formMessage && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: formMessage.includes('Thanks') ? '#e8f5e9' : '#ffebee',
          color: formMessage.includes('Thanks') ? '#2e7d32' : '#c62828',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {formMessage}
        </div>
      )}

      <p style={{
        marginTop: '16px',
        fontSize: '14px',
        color: '#6b7580',
        textAlign: 'center'
      }}>
        Or email us directly at <a href="mailto:info@brewedat.com" style={{ color: '#fd5526', textDecoration: 'none', fontWeight: '600' }}>info@brewedat.com</a>
      </p>
    </form>
  );
}
