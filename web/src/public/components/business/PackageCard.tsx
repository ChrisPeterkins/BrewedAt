interface PackageCardProps {
  name: string;
  price: string;
  period?: string;
  icon: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  onLearnMore: () => void;
}

export default function PackageCard({
  name,
  price,
  period = '/month',
  icon,
  features,
  highlighted = false,
  badge,
  onLearnMore
}: PackageCardProps) {
  return (
    <div
      className={`package-card ${highlighted ? 'package-card-highlighted' : ''}`}
      style={{
        background: 'white',
        borderRadius: '16px',
        border: highlighted ? '3px solid #fd5526' : '2px solid #E0E0E0',
        padding: '40px 32px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = '#fd5526';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        if (!highlighted) {
          e.currentTarget.style.borderColor = '#E0E0E0';
        }
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: '20px',
          background: '#fd5526',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {badge}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '16px',
          color: '#fd5526',
          fontWeight: '300',
          lineHeight: '1'
        }}>{icon}</div>
        <h3 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f3540',
          marginBottom: '8px'
        }}>
          {name}
        </h3>
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            fontSize: '40px',
            fontWeight: '800',
            color: '#fd5526'
          }}>
            {price}
          </span>
          <span style={{
            fontSize: '18px',
            color: '#25303d',
            fontWeight: '500'
          }}>
            {period}
          </span>
        </div>
      </div>

      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: '0 0 32px 0',
        flex: 1
      }}>
        {features.map((feature, index) => (
          <li key={index} style={{
            padding: '12px 0',
            paddingLeft: '32px',
            position: 'relative',
            fontSize: '15px',
            color: '#25303d',
            lineHeight: '1.6',
            borderBottom: index < features.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              color: '#fd5526',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onLearnMore}
        style={{
          width: '100%',
          padding: '16px 32px',
          background: highlighted ? '#fd5526' : '#1f3540',
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
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(253, 85, 38, 0.3)';
          e.currentTarget.style.background = '#e04515';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.background = highlighted ? '#fd5526' : '#1f3540';
        }}
      >
        Learn More
      </button>
    </div>
  );
}
