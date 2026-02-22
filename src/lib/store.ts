import { create } from 'zustand';
import type { Department, Subject, Resource, ViewState } from '@/types';
import { fetchDriveData } from './drive-api';
import { isAutoDetectEnabled, SUBJECTS_DATA, RESOURCES_DATA } from './constants';

type ResourceMode = 'all' | 'classResources' | 'textbooks';

interface AppState {
  currentView: ViewState;
  selectedDepartment: Department | null;
  selectedSubject: Subject | null;
  selectedResource: Resource | null;
  isPdfViewerOpen: boolean;
  resourceMode: ResourceMode;
  
  // Data
  subjectsData: Record<string, Subject[]>;
  resourcesData: Record<string, Resource[]>;
  isLoading: boolean;
  dataLoaded: boolean;
  autoDetectEnabled: boolean;
  
  // Actions
  setSelectedDepartment: (department: Department | null) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setResourceMode: (mode: ResourceMode) => void;
  openPdfViewer: (resource: Resource) => void;
  closePdfViewer: () => void;
  goHome: () => void;
  goBack: () => void;
  loadAllData: () => Promise<void>;
  getSubjects: (departmentId: string) => Subject[];
  getResources: (subjectId: string) => Resource[];
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'home',
  selectedDepartment: null,
  selectedSubject: null,
  selectedResource: null,
  isPdfViewerOpen: false,
  resourceMode: 'all',
  
  subjectsData: SUBJECTS_DATA,
  resourcesData: RESOURCES_DATA,
  isLoading: false,
  dataLoaded: false,
  autoDetectEnabled: isAutoDetectEnabled(),
  
  setSelectedDepartment: (department) => set({ 
    selectedDepartment: department,
    currentView: department ? 'department' : 'home',
    selectedSubject: null,
  }),
  
  setSelectedSubject: (subject) => set({ 
    selectedSubject: subject,
    currentView: subject ? 'subject' : 'department',
  }),
  
  setResourceMode: (mode) => set({ resourceMode: mode }),
  
  openPdfViewer: (resource) => set({ 
    selectedResource: resource,
    isPdfViewerOpen: true,
  }),
  
  closePdfViewer: () => set({ isPdfViewerOpen: false }),
  
  goBack: () => {
    const state = get();
    if (state.isPdfViewerOpen) {
      set({ isPdfViewerOpen: false });
    } else if (state.selectedSubject) {
      set({ selectedSubject: null, currentView: 'department' });
    } else if (state.selectedDepartment) {
      set({ selectedDepartment: null, currentView: 'home' });
    }
  },
  
  goHome: () => set({ 
    currentView: 'home',
    selectedDepartment: null,
    selectedSubject: null,
    selectedResource: null,
    isPdfViewerOpen: false,
    resourceMode: 'all',
  }),
  
  loadAllData: async () => {
    const state = get();
    if (state.dataLoaded) return;
    
    // Check if auto-detect is enabled (API key provided)
    if (!isAutoDetectEnabled()) {
      // Use manual data from constants
      set({ 
        dataLoaded: true,
        subjectsData: SUBJECTS_DATA,
        resourcesData: RESOURCES_DATA,
      });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { subjectsData, resourcesData } = await fetchDriveData();
      
      // Check if we got any data from Drive
      const hasDriveData = Object.values(subjectsData).some(arr => arr.length > 0);
      
      if (hasDriveData) {
        set({ 
          subjectsData, 
          resourcesData, 
          dataLoaded: true,
          isLoading: false,
        });
      } else {
        // Fall back to manual data
        set({ 
          dataLoaded: true,
          isLoading: false,
          subjectsData: SUBJECTS_DATA,
          resourcesData: RESOURCES_DATA,
        });
      }
    } catch {
      // Fall back to manual data on error
      set({ 
        dataLoaded: true, 
        isLoading: false,
        subjectsData: SUBJECTS_DATA,
        resourcesData: RESOURCES_DATA,
      });
    }
  },
  
  getSubjects: (departmentId: string) => {
    const state = get();
    return state.subjectsData[departmentId] || [];
  },
  
  getResources: (subjectId: string) => {
    const state = get();
    return state.resourcesData[subjectId] || [];
  },
}));
