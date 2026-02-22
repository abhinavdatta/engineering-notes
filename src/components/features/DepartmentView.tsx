'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { SEMESTERS } from '@/lib/constants';

export function DepartmentView() {
  const { 
    selectedDepartment, 
    goBack, 
    setSelectedSubject, 
    resourceMode,
    getSubjects,
    autoDetectEnabled
  } = useAppStore();

  const subjects = useMemo(() => {
    if (!selectedDepartment) return [];
    return getSubjects(selectedDepartment.id);
  }, [selectedDepartment, getSubjects]);

  if (!selectedDepartment) return null;

  const subjectsBySemester = SEMESTERS.map(sem => ({
    ...sem,
    subjects: subjects.filter(s => s.semester === sem.number)
  })).filter(sem => sem.subjects.length > 0);

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
            &larr; Back to All Departments
          </button>
          
          <h1 style={{ fontSize: '24px', margin: '15px 0 5px 0' }}>
            {selectedDepartment.name}
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 5px 0' }}>
            {resourceMode === 'textbooks' ? 'Textbooks' : 'Class Resources'}
          </p>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
            Total Subjects: {subjects.length}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {subjects.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            background: '#e6f3ff',
            border: '2px solid #0066cc'
          }}>
            <p style={{ fontSize: '18px', margin: '0 0 15px 0' }}>No subjects found!</p>
            
            {!autoDetectEnabled ? (
              <>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
                  Add subjects manually in <code>src/lib/constants.ts</code>:
                </p>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '15px', 
                  borderRadius: '5px',
                  textAlign: 'left',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
{`SUBJECTS_DATA = {
  '${selectedDepartment.id}': [
    { id: '${selectedDepartment.id.substring(0,2)}101', 
      code: '${selectedDepartment.code.toUpperCase()}101', 
      name: 'Subject Name', 
      semester: 1, 
      departmentId: '${selectedDepartment.id}' },
  ],
};`}
                </pre>
              </>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
                  Create folders in your Google Drive:
                </p>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '15px', 
                  borderRadius: '5px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  display: 'inline-block'
                }}>
                  <p style={{ margin: '0 0 5px 0' }}>{selectedDepartment.code.toUpperCase()}/</p>
                  <p style={{ margin: '0 0 5px 20px' }}>sem1/</p>
                  <p style={{ margin: '0 0 5px 40px' }}>{selectedDepartment.code.toUpperCase()}101-Subject Name/</p>
                  <p style={{ margin: '0 0 5px 60px' }}>notes.pdf</p>
                </div>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>
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
        ) : (
          subjectsBySemester.map(sem => (
            <div key={sem.number} style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '18px', 
                background: '#e0e0e0',
                padding: '8px 12px',
                margin: '0 0 10px 0',
                borderLeft: '4px solid #333'
              }}>
                {sem.name} ({sem.subjects.length} subjects)
              </h2>
              <table style={{ width: '100%', border: '1px solid #999' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ border: '1px solid #999', padding: '8px', textAlign: 'left', width: '80px' }}>Code</th>
                    <th style={{ border: '1px solid #999', padding: '8px', textAlign: 'left' }}>Subject Name</th>
                    <th style={{ border: '1px solid #999', padding: '8px', textAlign: 'center', width: '80px' }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {sem.subjects.map((subject, idx) => (
                    <tr key={subject.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ border: '1px solid #999', padding: '8px', fontWeight: 'bold' }}>
                        {subject.code}
                      </td>
                      <td style={{ border: '1px solid #999', padding: '8px' }}>
                        {subject.name}
                      </td>
                      <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedSubject(subject)}
                          style={{
                            background: '#0066cc',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 15px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
