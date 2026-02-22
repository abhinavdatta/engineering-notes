'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { RESOURCE_TYPES } from '@/lib/constants';
import type { ResourceType } from '@/types';

export function SubjectView() {
  const { 
    selectedSubject, 
    selectedDepartment, 
    goBack, 
    openPdfViewer, 
    resourceMode,
    getResources,
    autoDetectEnabled
  } = useAppStore();

  const resources = useMemo(() => {
    if (!selectedSubject) return [];
    return getResources(selectedSubject.id);
  }, [selectedSubject, getResources]);

  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');

  if (!selectedSubject || !selectedDepartment) return null;

  const modeFilteredResources = resourceMode === 'textbooks' 
    ? resources.filter(r => r.type === 'TEXTBOOK')
    : resources.filter(r => r.type !== 'TEXTBOOK');

  const filteredResources = selectedType === 'all' 
    ? modeFilteredResources 
    : modeFilteredResources.filter(r => r.type === selectedType);

  const typeLabels: Record<ResourceType | 'all', string> = {
    all: 'All Files',
    NOTES: 'Notes',
    TEXTBOOK: 'Textbooks',
    QUESTION_PAPER: 'Question Papers',
    LAB_MANUAL: 'Lab Manuals',
    OTHER: 'Other'
  };

  const availableTypes = resourceMode === 'textbooks' 
    ? ['all', 'TEXTBOOK'] as (ResourceType | 'all')[]
    : ['all', 'NOTES', 'QUESTION_PAPER', 'LAB_MANUAL', 'OTHER'] as (ResourceType | 'all')[];

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px',
        borderBottom: '2px solid #333'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
          >
            &larr; Back to {selectedDepartment.name}
          </button>
          
          <h1 style={{ fontSize: '22px', margin: '15px 0 5px 0' }}>
            {selectedSubject.name}
          </h1>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <span style={{ 
              background: '#333', 
              color: '#fff', 
              padding: '2px 8px',
              marginRight: '10px'
            }}>
              {selectedSubject.code}
            </span>
            <span>Semester {selectedSubject.semester} | {selectedDepartment.code} | {resourceMode === 'textbooks' ? 'Textbooks' : 'Class Resources'}</span>
          </div>
        </div>
      </div>

      <div style={{ 
        background: '#e8e8e8', 
        padding: '10px 20px',
        borderBottom: '1px solid #ccc'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>File Type:</span>
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                background: selectedType === type ? '#333' : '#fff',
                color: selectedType === type ? '#fff' : '#000',
                border: '1px solid #999',
                padding: '5px 10px',
                marginRight: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {filteredResources.length > 0 ? (
          <table style={{ width: '100%', border: '1px solid #999' }}>
            <thead>
              <tr style={{ background: '#e0e0e0' }}>
                <th style={{ border: '1px solid #999', padding: '8px', textAlign: 'left', width: '40px' }}>#</th>
                <th style={{ border: '1px solid #999', padding: '8px', textAlign: 'left' }}>File Name</th>
                <th style={{ border: '1px solid #999', padding: '8px', textAlign: 'center', width: '100px' }}>Type</th>
                <th style={{ border: '1px solid #999', padding: '8px', textAlign: 'center', width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource, idx) => (
                <tr key={resource.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center' }}>
                    {idx + 1}
                  </td>
                  <td style={{ border: '1px solid #999', padding: '8px' }}>
                    <div style={{ fontWeight: 'bold' }}>{resource.title}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>{resource.fileName}</div>
                  </td>
                  <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px' }}>
                      {RESOURCE_TYPES[resource.type]?.label || resource.type}
                    </span>
                  </td>
                  <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => openPdfViewer(resource)}
                      style={{
                        background: '#28a745',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        marginRight: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      View
                    </button>
                    {resource.driveUrl && (
                      <button
                        onClick={() => window.open(resource.driveUrl.replace('/preview', '/view'), '_blank')}
                        style={{
                          background: '#0066cc',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Open
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px', 
            background: '#fff9e6',
            border: '2px dashed #ffcc00'
          }}>
            <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>No {resourceMode === 'textbooks' ? 'textbooks' : 'class resources'} found!</p>
            
            {!autoDetectEnabled ? (
              <>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
                  Add resources in <code>src/lib/constants.ts</code>:
                </p>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '15px', 
                  borderRadius: '5px',
                  textAlign: 'left',
                  fontSize: '11px',
                  overflow: 'auto'
                }}>
{`RESOURCES_DATA['${selectedSubject.id}'] = [
  { 
    id: '${selectedSubject.id}-n1', 
    title: 'Notes Title', 
    type: 'NOTES', 
    fileName: 'notes.pdf',
    filePath: '',
    driveUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID/preview',
    subjectId: '${selectedSubject.id}'
  },
];`}
                </pre>
              </>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>
                  Upload PDFs to your Google Drive folder:
                </p>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                  <i>{selectedDepartment.code}/sem{selectedSubject.semester}/{selectedSubject.code}-{selectedSubject.name}/</i>
                </p>
                <p style={{ fontSize: '12px', marginTop: '15px' }}>
                  <a 
                    href="https://drive.google.com/drive/folders/1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#0066cc' }}
                  >
                    Open Drive Folder →
                  </a>
                </p>
              </>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '30px',
          background: '#e6f7ff',
          border: '1px solid #0066cc',
          padding: '15px',
          fontSize: '13px'
        }}>
          <b>Tip:</b> Click "View" to open PDF in browser, or "Open" to view in Google Drive.
        </div>
      </div>
    </div>
  );
}
