'use client';

import { useEffect } from 'react';
import type { Department } from '@/types';
import { DEPARTMENTS } from '@/lib/constants';
import { useAppStore } from '@/lib/store';

export function HomeView() {
  const { 
    setSelectedDepartment, 
    setResourceMode, 
    resourceMode,
    loadAllData,
    isLoading,
    autoDetectEnabled,
    dataLoaded
  } = useAppStore();

  useEffect(() => {
    if (!dataLoaded) {
      loadAllData();
    }
  }, []);

  const handleTabChange = (tab: 'classResources' | 'textbooks') => {
    setResourceMode(tab);
  };

  const handleDepartmentClick = (dept: Department) => {
    setSelectedDepartment(dept);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ 
        background: 'linear-gradient(to bottom, #e6f2ff, #fff)', 
        padding: '30px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #0066cc'
      }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', color: '#0066cc' }}>
          Engineering Notes & Textbooks
        </h1>
        <p style={{ fontSize: '16px', color: '#333', margin: '0 0 20px 0' }}>
          All Departments | Free Download
        </p>
        <div style={{ 
          background: '#ffffcc', 
          border: '2px dashed #cc9900', 
          padding: '10px', 
          display: 'inline-block',
          fontSize: '14px'
        }}>
          Under Construction - More notes coming soon!
          {isLoading && <span style={{ marginLeft: '10px', color: '#0066cc' }}>Loading from Google Drive...</span>}
        </div>
      </div>

      <div style={{ 
        background: '#e8e8e8', 
        padding: '0 20px',
        borderBottom: '1px solid #ccc'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button
            onClick={() => handleTabChange('classResources')}
            style={{
              background: resourceMode === 'classResources' ? '#fff' : 'transparent',
              color: '#000',
              border: 'none',
              borderBottom: resourceMode === 'classResources' ? '3px solid #0066cc' : '3px solid transparent',
              padding: '15px 25px',
              fontSize: '14px',
              fontWeight: resourceMode === 'classResources' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Class Resources
          </button>
          <button
            onClick={() => handleTabChange('textbooks')}
            style={{
              background: resourceMode === 'textbooks' ? '#fff' : 'transparent',
              color: '#000',
              border: 'none',
              borderBottom: resourceMode === 'textbooks' ? '3px solid #0066cc' : '3px solid transparent',
              padding: '15px 25px',
              fontSize: '14px',
              fontWeight: resourceMode === 'textbooks' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Textbooks
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {!autoDetectEnabled && (
          <div style={{ 
            marginBottom: '20px',
            background: '#e6f3ff',
            border: '2px solid #0066cc',
            padding: '20px',
            borderRadius: '5px'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Manual Mode</p>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
              Add subjects and PDFs manually in <code>src/lib/constants.ts</code>
            </p>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
              <b>For Auto-Detection:</b> Add a Google Drive API key in <code>DRIVE_CONFIG.apiKey</code>
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
              Get API key from: Google Cloud Console → Credentials → Create API Key → Enable Drive API
            </p>
          </div>
        )}

        <h2 style={{ 
          fontSize: '22px', 
          borderBottom: '2px solid #333', 
          paddingBottom: '5px',
          marginBottom: '20px'
        }}>
          {resourceMode === 'textbooks' ? 'Choose Your Department - Textbooks' : 'Choose Your Department - Class Resources'}
        </h2>

        <table style={{ width: '100%', border: '1px solid #999' }}>
          <thead>
            <tr style={{ background: '#e0e0e0' }}>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'left' }}>Code</th>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'left' }}>Department</th>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map((dept, index) => (
              <tr key={dept.id} style={{ background: index % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                <td style={{ border: '1px solid #999', padding: '10px', fontWeight: 'bold' }}>
                  <span style={{ 
                    background: '#333', 
                    color: '#fff', 
                    padding: '2px 8px',
                    fontSize: '12px'
                  }}>
                    {dept.code}
                  </span>
                </td>
                <td style={{ border: '1px solid #999', padding: '10px', fontWeight: 'bold' }}>
                  {dept.name}
                </td>
                <td style={{ border: '1px solid #999', padding: '10px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDepartmentClick(dept)}
                    style={{
                      background: '#0066cc',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 20px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ 
          marginTop: '40px', 
          background: '#f0fff0', 
          border: '2px solid #009900',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#009900' }}>
            How to Download {resourceMode === 'textbooks' ? 'Textbooks' : 'Notes'}?
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Click on your department above</li>
            <li>Select your semester and subject</li>
            <li>Click on the PDF you want</li>
            <li>View online or download for free!</li>
          </ol>
        </div>

        <div style={{ 
          marginTop: '30px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '15px',
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <b>Important:</b> This website relies on your notes and other sources. If you have study materials to share, please send it to <a href="mailto:example@mail.com" style={{ color: '#0066cc' }}>example@mail.com</a>
          </p>
        </div>

        <div style={{ 
          marginTop: '20px',
          background: '#f5f5f5',
          border: '1px solid #ccc',
          padding: '15px',
          fontSize: '13px'
        }}>
          <b>Google Drive Folder:</b>{' '}
          <a 
            href={`https://drive.google.com/drive/folders/1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#0066cc' }}
          >
            Open Drive Folder
          </a>
          <br />
          <span style={{ color: '#666' }}>
            Upload PDFs to: Department → Semester → Subject folders
          </span>
        </div>
      </div>
    </div>
  );
}
