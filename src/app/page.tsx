'use client';

import { Header } from '@/components/features/Header';
import { Footer } from '@/components/features/Footer';
import { HomeView } from '@/components/features/HomeView';
import { DepartmentView } from '@/components/features/DepartmentView';
import { SubjectView } from '@/components/features/SubjectView';
import { PdfViewer } from '@/components/features/PdfViewer';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const currentView = useAppStore((state) => state.currentView);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Header />
      
      <main style={{ flex: 1 }}>
        {currentView === 'home' && <HomeView />}
        {currentView === 'department' && <DepartmentView />}
        {currentView === 'subject' && <SubjectView />}
      </main>
      
      <Footer />
      <PdfViewer />
    </div>
  );
}
