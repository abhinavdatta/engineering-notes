'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { RESOURCE_TYPES } from '@/lib/constants';

export function PdfViewer() {
  const { isPdfViewerOpen, selectedResource, closePdfViewer } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  if (!selectedResource) return null;

  const resourceType = RESOURCE_TYPES[selectedResource.type];

  // Use Google Drive preview URL
  const viewerUrl = selectedResource.driveUrl || '';

  if (!isPdfViewerOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Bar */}
      <div style={{
        background: '#333',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <span style={{ fontSize: '14px' }}>{selectedResource.title}</span>
          <span style={{ 
            marginLeft: '10px', 
            background: '#555', 
            padding: '2px 8px',
            fontSize: '11px'
          }}>
            {resourceType?.label}
          </span>
        </div>
        <div>
          {selectedResource.driveUrl && (
            <button
              onClick={() => window.open(selectedResource.driveUrl.replace('/preview', '/view'), '_blank')}
              style={{
                background: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '8px 15px',
                marginRight: '10px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Open in Drive
            </button>
          )}
          <button
            onClick={() => closePdfViewer()}
            style={{
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              padding: '8px 15px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: '20px 40px',
          border: '2px solid #333'
        }}>
          <p style={{ margin: 0 }}>Loading PDF... Please wait...</p>
        </div>
      )}

      {/* PDF Frame */}
      <div style={{ flex: 1, background: '#666' }}>
        {viewerUrl ? (
          <iframe
            src={viewerUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            onLoad={() => setIsLoading(false)}
            title="PDF Viewer"
            allow="autoplay"
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#fff'
          }}>
            <p>No PDF link configured for this resource.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: '#f0f0f0',
        padding: '5px 20px',
        fontSize: '11px',
        color: '#666',
        textAlign: 'center'
      }}>
        File: {selectedResource.fileName}
      </div>
    </div>
  );
}
