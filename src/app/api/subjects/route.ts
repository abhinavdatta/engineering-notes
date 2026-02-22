import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Sample subjects for demo when database is empty
const SAMPLE_SUBJECTS: Record<string, Array<{ id: string; code: string; name: string; semester: number }>> = {
  'cse': [
    { id: 'cs101', code: 'CS101', name: 'Programming in C', semester: 1 },
    { id: 'cs102', code: 'CS102', name: 'Data Structures', semester: 2 },
    { id: 'cs201', code: 'CS201', name: 'Object Oriented Programming', semester: 3 },
    { id: 'cs202', code: 'CS202', name: 'Database Management Systems', semester: 4 },
    { id: 'cs301', code: 'CS301', name: 'Operating Systems', semester: 5 },
    { id: 'cs302', code: 'CS302', name: 'Computer Networks', semester: 5 },
    { id: 'cs401', code: 'CS401', name: 'Machine Learning', semester: 7 },
    { id: 'cs402', code: 'CS402', name: 'Software Engineering', semester: 6 },
  ],
  'ece': [
    { id: 'ec101', code: 'EC101', name: 'Basic Electronics', semester: 1 },
    { id: 'ec102', code: 'EC102', name: 'Digital Electronics', semester: 2 },
    { id: 'ec201', code: 'EC201', name: 'Signals and Systems', semester: 3 },
    { id: 'ec202', code: 'EC202', name: 'Communication Systems', semester: 4 },
    { id: 'ec301', code: 'EC301', name: 'Microprocessors', semester: 5 },
  ],
  'eie': [
    { id: 'ei101', code: 'EI101', name: 'Instrumentation Fundamentals', semester: 1 },
    { id: 'ei102', code: 'EI102', name: 'Sensors and Transducers', semester: 2 },
    { id: 'ei201', code: 'EI201', name: 'Process Control', semester: 3 },
    { id: 'ei202', code: 'EI202', name: 'Industrial Automation', semester: 4 },
  ],
  'eee': [
    { id: 'ee101', code: 'EE101', name: 'Electrical Circuits', semester: 1 },
    { id: 'ee102', code: 'EE102', name: 'Electrical Machines', semester: 2 },
    { id: 'ee201', code: 'EE201', name: 'Power Systems', semester: 3 },
  ],
  'me': [
    { id: 'me101', code: 'ME101', name: 'Engineering Mechanics', semester: 1 },
    { id: 'me102', code: 'ME102', name: 'Thermodynamics', semester: 2 },
    { id: 'me201', code: 'ME201', name: 'Fluid Mechanics', semester: 3 },
  ],
  'ce': [
    { id: 'ce101', code: 'CE101', name: 'Strength of Materials', semester: 1 },
    { id: 'ce102', code: 'CE102', name: 'Structural Analysis', semester: 2 },
    { id: 'ce201', code: 'CE201', name: 'Geotechnical Engineering', semester: 3 },
  ],
  'it': [
    { id: 'it101', code: 'IT101', name: 'Web Technologies', semester: 1 },
    { id: 'it102', code: 'IT102', name: 'Database Systems', semester: 2 },
    { id: 'it201', code: 'IT201', name: 'Cloud Computing', semester: 5 },
  ],
  'aids': [
    { id: 'ai101', code: 'AI101', name: 'Introduction to AI', semester: 1 },
    { id: 'ai102', code: 'AI102', name: 'Machine Learning Fundamentals', semester: 2 },
    { id: 'ai201', code: 'AI201', name: 'Deep Learning', semester: 5 },
    { id: 'ai202', code: 'AI202', name: 'Natural Language Processing', semester: 6 },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    if (!departmentId) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    // Try to get subjects from database
    const dbSubjects = await db.subject.findMany({
      where: { departmentId },
      include: {
        _count: {
          select: { resources: true }
        }
      },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }]
    });

    if (dbSubjects.length > 0) {
      return NextResponse.json({ 
        subjects: dbSubjects.map(s => ({
          id: s.id,
          code: s.code,
          name: s.name,
          semester: s.semester,
          departmentId: s.departmentId,
          resourceCount: s._count.resources,
        }))
      });
    }

    // Fallback to sample data
    const sampleSubjects = SAMPLE_SUBJECTS[departmentId] || [];
    return NextResponse.json({ 
      subjects: sampleSubjects.map(s => ({
        ...s,
        departmentId,
        resourceCount: Math.floor(Math.random() * 5) + 1,
      }))
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    // Return sample data on error
    const departmentId = new URL(request.url).searchParams.get('departmentId') || 'cse';
    return NextResponse.json({ 
      subjects: SAMPLE_SUBJECTS[departmentId] || []
    });
  }
}
