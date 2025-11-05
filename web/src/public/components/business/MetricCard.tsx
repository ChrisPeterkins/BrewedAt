interface MetricCardProps {
  icon: string | React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
}

export default function MetricCard({ icon, value, label, sublabel }: MetricCardProps) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '32px 24px',
      background: 'white',
      borderRadius: '12px',
      border: '2px solid #E0E0E0',
      transition: 'all 0.3s ease'
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
        fontSize: typeof icon === 'string' ? '48px' : 'inherit',
        marginBottom: '16px',
        color: '#fd5526'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '40px',
        fontWeight: '800',
        color: '#fd5526',
        marginBottom: '8px',
        lineHeight: '1'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f3540',
        marginBottom: sublabel ? '4px' : '0'
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{
          fontSize: '14px',
          color: '#6b7580'
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
