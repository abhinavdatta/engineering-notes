'use client';

export function Footer() {
  return (
    <footer style={{ 
      background: '#333', 
      color: '#ccc', 
      padding: '15px 20px',
      textAlign: 'center',
      borderTop: '3px solid #666'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ fontSize: '12px', marginBottom: '10px' }}>
          <a href="#" style={{ color: '#99ccff', marginRight: '20px' }}>About Us</a>
          <a href="#" style={{ color: '#99ccff' }}>Report Issue</a>
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>
          (c) 2025 EngNotes - Engineering Notes & Textbooks
          <br />
          <span style={{ fontSize: '10px' }}>Best viewed in Chrome/Firefox | Screen resolution 1366x768</span>
        </p>
      </div>
    </footer>
  );
}
