import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

export default function QRCodeModal({ brewery, onClose }) {
  const qrRef = useRef(null);

  const qrData = JSON.stringify({
    app: 'BrewedAt',
    breweryId: brewery.id,
  });

  const handleDownload = async () => {
    if (!qrRef.current) return;

    const canvas = await html2canvas(qrRef.current, {
      backgroundColor: '#FFFFFF',
      scale: 3,
    });

    const link = document.createElement('a');
    link.download = `${brewery.name.replace(/\s+/g, '-')}-QR.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>QR Code for {brewery.name}</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div ref={qrRef} style={styles.qrContainer}>
          <QRCodeSVG
            value={qrData}
            size={300}
            level="H"
            includeMargin={true}
          />
          <p style={styles.breweryName}>{brewery.name}</p>
          <p style={styles.instructions}>Scan to check in and earn {brewery.pointsReward} points</p>
        </div>

        <div style={styles.actions}>
          <button style={styles.downloadButton} onClick={handleDownload}>
            Download PNG
          </button>
          <button style={styles.printButton} onClick={handlePrint}>
            Print
          </button>
        </div>

        <div style={styles.info}>
          <p style={styles.infoText}><strong>Brewery ID:</strong> {brewery.id}</p>
          <p style={styles.infoText}><strong>Address:</strong> {brewery.address}</p>
          <p style={styles.infoText}><strong>Points Reward:</strong> {brewery.pointsReward}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#654321',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    color: '#999',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px',
    backgroundColor: '#FAFAF8',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  breweryName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#654321',
    marginTop: '16px',
    marginBottom: '8px',
    textAlign: 'center',
  },
  instructions: {
    fontSize: '14px',
    color: '#8B4513',
    textAlign: 'center',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  printButton: {
    flex: 1,
    backgroundColor: '#654321',
    color: '#FFFFFF',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  info: {
    backgroundColor: '#F5F5F5',
    padding: '16px',
    borderRadius: '8px',
  },
  infoText: {
    fontSize: '14px',
    color: '#654321',
    margin: '4px 0',
  },
};