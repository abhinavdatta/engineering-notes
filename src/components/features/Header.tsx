'use client';

import { useAppStore } from '@/lib/store';
import { DEPARTMENTS } from '@/lib/constants';

export function Header() {
  const { selectedDepartment, selectedSubject, goHome, setSelectedDepartment } = useAppStore();

  return (
    <header style={{ 
      background: '#f0f0f0', 
      borderBottom: '2px solid #333',
      padding: '10px 20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={goHome}
              style={{
                background: '#333',
                color: '#fff',
                border: 'none',
                padding: '8px 15px',
                fontSize: '14px'
              }}
            >
              HOME
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              EngNotes
            </h1>
          </div>

          {/* Breadcrumb */}
          <div style={{ fontSize: '14px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); goHome(); }}>Home</a>
            {selectedDepartment && (
              <>
                {' >> '}
                <span style={{ color: '#666' }}>{selectedDepartment.name}</span>
              </>
            )}
            {selectedSubject && (
              <>
                {' >> '}
                <span style={{ color: '#666' }}>{selectedSubject.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Department Links */}
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Departments:</span>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept)}
              style={{
                background: selectedDepartment?.id === dept.id ? '#333' : '#ddd',
                color: selectedDepartment?.id === dept.id ? '#fff' : '#000',
                border: '1px solid #999',
                padding: '3px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {dept.code}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
