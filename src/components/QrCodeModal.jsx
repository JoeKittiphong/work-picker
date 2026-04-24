import AppModal from './AppModal'

export default function QrCodeModal({ onClose }) {
  const url = 'https://stellular-kitten-abd5d4.netlify.app/'

  return (
    <AppModal onClose={onClose} title="สแกน QR Code">
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', fontSize: '14px' }}>
          สแกนด้วยกล้องมือถือเพื่อเข้าใช้งานแอปนี้บนมือถือได้เลย
        </p>
        
        <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`} 
            alt="QR Code" 
            style={{ display: 'block', width: '200px', height: '200px' }} 
          />
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', wordBreak: 'break-all' }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 'bold' }}>
            {url}
          </a>
        </div>
      </div>
    </AppModal>
  )
}
