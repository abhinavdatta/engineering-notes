import type { Department, ResourceType, Subject, Resource } from '@/types';

// =====================================================
// DEPARTMENTS
// =====================================================
export const DEPARTMENTS: Department[] = [
  { id: 'cse', code: 'CSE', name: 'Computer Science & Engineering', icon: '[CSE]', color: '#3B82F6' },
  { id: 'ece', code: 'ECE', name: 'Electronics & Communication Engineering', icon: '[ECE]', color: '#10B981' },
  { id: 'eie', code: 'EIE', name: 'Electronics & Instrumentation Engineering', icon: '[EIE]', color: '#8B5CF6' },
  { id: 'eee', code: 'EEE', name: 'Electrical & Electronics Engineering', icon: '[EEE]', color: '#F59E0B' },
  { id: 'me', code: 'ME', name: 'Mechanical Engineering', icon: '[ME]', color: '#EF4444' },
  { id: 'ce', code: 'CE', name: 'Civil Engineering', icon: '[CE]', color: '#6366F1' },
  { id: 'it', code: 'IT', name: 'Information Technology', icon: '[IT]', color: '#14B8A6' },
  { id: 'aids', code: 'AIDS', name: 'Artificial Intelligence & Data Science', icon: '[AIDS]', color: '#EC4899' },
];

export const RESOURCE_TYPES: Record<ResourceType, { label: string; icon: string; color: string }> = {
  NOTES: { label: 'Notes', icon: '[N]', color: '#3B82F6' },
  TEXTBOOK: { label: 'Textbook', icon: '[T]', color: '#10B981' },
  QUESTION_PAPER: { label: 'Question Paper', icon: '[Q]', color: '#F59E0B' },
  LAB_MANUAL: { label: 'Lab Manual', icon: '[L]', color: '#8B5CF6' },
  OTHER: { label: 'Other', icon: '[O]', color: '#6B7280' },
};

export const SEMESTERS = [
  { number: 1, name: '1st Semester' },
  { number: 2, name: '2nd Semester' },
  { number: 3, name: '3rd Semester' },
  { number: 4, name: '4th Semester' },
  { number: 5, name: '5th Semester' },
  { number: 6, name: '6th Semester' },
  { number: 7, name: '7th Semester' },
  { number: 8, name: '8th Semester' },
];

// =====================================================
// GOOGLE DRIVE CONFIGURATION
// =====================================================
export const DRIVE_CONFIG = {
  // Your main Google Drive folder ID
  // From: https://drive.google.com/drive/folders/1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG
  folderId: '1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG',
  
  // Google Drive API Key (optional - for auto-detection)
  // Get it from: https://console.cloud.google.com/apis/credentials
  // 1. Go to Google Cloud Console
  // 2. Create a new project or select existing
  // 3. Enable "Google Drive API"
  // 4. Go to Credentials → Create Credentials → API Key
  // 5. (Optional) Restrict the key to only Drive API
  apiKey: 'AIzaSyCC8BbNNG2HhwEJ74GRBoos_lvREUPUN2Y', // Leave empty to use manual config
};

// Check if auto-detection is enabled
export function isAutoDetectEnabled(): boolean {
  return !!(DRIVE_CONFIG.apiKey && DRIVE_CONFIG.folderId);
}

// =====================================================
// MANUAL CONFIGURATION (Fallback when no API key)
// Add subjects and resources here
// =====================================================

// SUBJECTS - Add your subjects here
// Format: departmentId -> array of subjects
export const SUBJECTS_DATA: Record<string, Subject[]> = {
  // Example - uncomment and modify:
  // 'cse': [
  //   { id: 'cs101', code: 'CS101', name: 'Programming in C', semester: 1, departmentId: 'cse' },
  //   { id: 'cs102', code: 'CS102', name: 'Data Structures', semester: 2, departmentId: 'cse' },
  // ],
};

// RESOURCES - Add your PDFs here
// Format: subjectId -> array of resources
// driveUrl format: https://drive.google.com/file/d/FILE_ID/preview
export const RESOURCES_DATA: Record<string, Resource[]> = {
  // Example - uncomment and modify:
  // 'cs101': [
  //   { 
  //     id: 'cs101-n1', 
  //     title: 'Introduction to C Programming', 
  //     type: 'NOTES', 
  //     fileName: 'c_intro.pdf',
  //     filePath: '',
  //     driveUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID/preview',
  //     subjectId: 'cs101'
  //   },
  // ],
};

// Helper functions
export function getSubjectsForDepartment(departmentId: string): Subject[] {
  return SUBJECTS_DATA[departmentId] || [];
}

export function getResourcesForSubject(subjectId: string): Resource[] {
  return RESOURCES_DATA[subjectId] || [];
}

// Build Drive preview URL from file ID
export function getDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

// Build Drive download URL from file ID
export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
