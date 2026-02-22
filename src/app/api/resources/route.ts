import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Resource, ResourceType } from '@/types';

// Sample resources for demo
const SAMPLE_RESOURCES: Record<string, Partial<Resource>[]> = {
  'cs101': [
    { id: 'r1', title: 'Introduction to C Programming', type: 'NOTES', fileName: 'c_intro.pdf', filePath: 'pdfs/CSE/sem1/CS101/c_intro.pdf' },
    { id: 'r2', title: 'C Programming Textbook', type: 'TEXTBOOK', fileName: 'c_textbook.pdf', filePath: 'pdfs/CSE/sem1/CS101/c_textbook.pdf' },
    { id: 'r3', title: 'Previous Year Questions', type: 'QUESTION_PAPER', fileName: 'cs101_pyq.pdf', filePath: 'pdfs/CSE/sem1/CS101/cs101_pyq.pdf' },
  ],
  'cs201': [
    { id: 'r4', title: 'OOP Concepts Notes', type: 'NOTES', fileName: 'oop_notes.pdf', filePath: 'pdfs/CSE/sem3/CS201/oop_notes.pdf' },
    { id: 'r5', title: 'Java Programming Guide', type: 'TEXTBOOK', fileName: 'java_guide.pdf', filePath: 'pdfs/CSE/sem3/CS201/java_guide.pdf' },
  ],
  'ec101': [
    { id: 'r6', title: 'Basic Electronics Notes', type: 'NOTES', fileName: 'electronics_notes.pdf', filePath: 'pdfs/ECE/sem1/EC101/electronics_notes.pdf' },
    { id: 'r7', title: 'Electronics Lab Manual', type: 'LAB_MANUAL', fileName: 'electronics_lab.pdf', filePath: 'pdfs/ECE/sem1/EC101/electronics_lab.pdf' },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const departmentId = searchParams.get('departmentId');

    // Get resources from GitHub
    if (departmentId) {
      try {
        const githubPath = `pdfs/${departmentId.toUpperCase()}`;
        const response = await fetch(`/api/github/contents?path=${githubPath}`);
        if (response.ok) {
          const data = await response.json();
          // Process GitHub files into resources
          const githubResources = processGitHubFiles(data.files || [], departmentId);
          return NextResponse.json({ resources: githubResources });
        }
      } catch (e) {
        console.error('GitHub fetch error:', e);
      }
    }

    if (subjectId) {
      // Try database first
      const dbResources = await db.resource.findMany({
        where: { subjectId },
        orderBy: { createdAt: 'desc' }
      });

      if (dbResources.length > 0) {
        return NextResponse.json({ resources: dbResources });
      }

      // Fallback to sample data
      const sampleResources = SAMPLE_RESOURCES[subjectId] || generateSampleResources(subjectId);
      return NextResponse.json({ resources: sampleResources });
    }

    return NextResponse.json({ error: 'Subject ID or Department ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching resources:', error);
    const subjectId = new URL(request.url).searchParams.get('subjectId') || 'cs101';
    return NextResponse.json({ 
      resources: SAMPLE_RESOURCES[subjectId] || generateSampleResources(subjectId)
    });
  }
}

function processGitHubFiles(files: any[], departmentId: string): Partial<Resource>[] {
  const resources: Partial<Resource>[] = [];
  
  for (const file of files) {
    if (file.type === 'file' && file.name.endsWith('.pdf')) {
      const type = determineResourceType(file.name);
      resources.push({
        id: file.sha,
        title: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
        type,
        fileName: file.name,
        filePath: file.path,
        fileSize: file.size,
        githubUrl: file.download_url,
      });
    }
  }
  
  return resources;
}

function determineResourceType(fileName: string): ResourceType {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('notes') || lowerName.includes('note')) return 'NOTES';
  if (lowerName.includes('textbook') || lowerName.includes('book')) return 'TEXTBOOK';
  if (lowerName.includes('question') || lowerName.includes('pyq') || lowerName.includes('exam')) return 'QUESTION_PAPER';
  if (lowerName.includes('lab') || lowerName.includes('manual')) return 'LAB_MANUAL';
  return 'OTHER';
}

function generateSampleResources(subjectId: string): Partial<Resource>[] {
  const types: ResourceType[] = ['NOTES', 'TEXTBOOK', 'QUESTION_PAPER'];
  return types.map((type, i) => ({
    id: `${subjectId}-r${i}`,
    title: `${subjectId.toUpperCase()} ${type.charAt(0) + type.slice(1).toLowerCase()}`,
    type,
    fileName: `${subjectId}_${type.toLowerCase()}.pdf`,
    filePath: `pdfs/${subjectId}/${type.toLowerCase()}.pdf`,
  }));
}
