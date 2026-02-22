// Types for the engineering notes platform

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  subjectCount?: number;
  resourceCount?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  departmentId: string;
  department?: Department;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  fileName: string;
  filePath?: string;
  fileSize?: number;
  driveUrl?: string;  // Google Drive preview URL
  subjectId: string;
  subject?: Subject;
}

export type ResourceType = 'NOTES' | 'TEXTBOOK' | 'QUESTION_PAPER' | 'LAB_MANUAL' | 'OTHER';

export interface Semester {
  number: number;
  name: string;
  subjects: Subject[];
}

export type ViewState = 'home' | 'department' | 'subject' | 'viewer';

export interface AppState {
  currentView: ViewState;
  selectedDepartment: Department | null;
  selectedSubject: Subject | null;
  selectedResource: Resource | null;
}
