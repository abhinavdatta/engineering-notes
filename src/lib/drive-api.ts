// Google Drive API integration for auto-detecting folders and PDFs
import type { Subject, Resource } from '@/types';
import { DEPARTMENTS, DRIVE_CONFIG, RESOURCE_TYPES, getDrivePreviewUrl } from './constants';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
}

interface DriveResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch from Google Drive API
async function fetchDriveAPI(endpoint: string): Promise<DriveResponse | null> {
  const { apiKey } = DRIVE_CONFIG;
  if (!apiKey) return null;

  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as DriveResponse;
  }

  try {
    const url = `https://www.googleapis.com/drive/v3${endpoint}&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Drive API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// Get files in a folder
async function getFilesInFolder(folderId: string): Promise<DriveFile[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const endpoint = `/files?q=${query}&fields=files(id,name,mimeType,parents)&pageSize=1000`;
  
  const response = await fetchDriveAPI(endpoint);
  return response?.files || [];
}

// Parse subject from folder name
function parseSubjectFromFolder(
  folderName: string,
  departmentId: string,
  semester: number
): Subject | null {
  // Match formats like: "CS101-Programming in C", "CS101_Programming", "CS101"
  const match = folderName.match(/^([A-Z]{2,3}\d{3})[-_\s]*(.*)$/i);
  
  if (match) {
    const code = match[1].toUpperCase();
    const name = match[2] 
      ? match[2].replace(/[-_]/g, ' ').trim() 
      : `Subject ${code}`;
    
    return {
      id: `${departmentId}-${code.toLowerCase()}`,
      code,
      name,
      semester,
      departmentId,
    };
  }
  
  // If no code match, use folder name as subject
  return {
    id: `${departmentId}-${folderName.toLowerCase().replace(/\s+/g, '-')}`,
    code: folderName.substring(0, 6).toUpperCase(),
    name: folderName,
    semester,
    departmentId,
  };
}

// Detect resource type from filename
function detectResourceType(fileName: string): Resource['type'] {
  const lower = fileName.toLowerCase();
  
  if (lower.includes('textbook') || lower.includes('book') || lower.includes('tb')) {
    return 'TEXTBOOK';
  }
  if (lower.includes('question') || lower.includes('qp') || lower.includes('pyq') || lower.includes('exam')) {
    return 'QUESTION_PAPER';
  }
  if (lower.includes('lab') || lower.includes('practical')) {
    return 'LAB_MANUAL';
  }
  return 'NOTES';
}

// Fetch all data from Google Drive
export async function fetchDriveData(): Promise<{
  subjectsData: Record<string, Subject[]>;
  resourcesData: Record<string, Resource[]>;
}> {
  const subjectsData: Record<string, Subject[]> = {};
  const resourcesData: Record<string, Resource[]> = {};

  if (!DRIVE_CONFIG.apiKey) {
    return { subjectsData, resourcesData };
  }

  try {
    // Get department folders in main folder
    const deptFolders = await getFilesInFolder(DRIVE_CONFIG.folderId);
    
    for (const deptFolder of deptFolders) {
      if (deptFolder.mimeType !== 'application/vnd.google-apps.folder') continue;
      
      // Match department by name (CSE, ECE, etc.)
      const deptCode = deptFolder.name.toUpperCase();
      const department = DEPARTMENTS.find(d => 
        d.code === deptCode || 
        d.name.toUpperCase().includes(deptCode) ||
        deptCode.includes(d.code)
      );
      
      if (!department) continue;
      
      // Get semester folders
      const semFolders = await getFilesInFolder(deptFolder.id);
      
      for (const semFolder of semFolders) {
        if (semFolder.mimeType !== 'application/vnd.google-apps.folder') continue;
        
        // Parse semester number from folder name
        const semMatch = semFolder.name.match(/(\d)/);
        const semester = semMatch ? parseInt(semMatch[1]) : 1;
        
        // Get subject folders
        const subjectFolders = await getFilesInFolder(semFolder.id);
        
        for (const subjectFolder of subjectFolders) {
          if (subjectFolder.mimeType !== 'application/vnd.google-apps.folder') continue;
          
          const subject = parseSubjectFromFolder(subjectFolder.name, department.id, semester);
          if (subject) {
            // Initialize department array if needed
            if (!subjectsData[department.id]) {
              subjectsData[department.id] = [];
            }
            subjectsData[department.id].push(subject);
            
            // Get PDFs in subject folder
            const files = await getFilesInFolder(subjectFolder.id);
            const pdfFiles = files.filter(f => 
              f.mimeType === 'application/pdf' || 
              f.name.toLowerCase().endsWith('.pdf')
            );
            
            resourcesData[subject.id] = pdfFiles.map((file, idx) => ({
              id: `${subject.id}-${idx}`,
              title: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
              type: detectResourceType(file.name),
              fileName: file.name,
              filePath: file.id,
              driveUrl: getDrivePreviewUrl(file.id),
              subjectId: subject.id,
            }));
          }
        }
      }
      
      // Sort subjects by semester and code
      if (subjectsData[department.id]) {
        subjectsData[department.id].sort((a, b) => {
          if (a.semester !== b.semester) return a.semester - b.semester;
          return a.code.localeCompare(b.code);
        });
      }
    }
  } catch {
    // Return empty data on error
  }

  return { subjectsData, resourcesData };
}

// Clear cache
export function clearDriveCache() {
  cache.clear();
}
