import { NextResponse } from 'next/server';
import { DEPARTMENTS } from '@/lib/constants';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Try to get departments from database first
    const dbDepartments = await db.department.findMany({
      include: {
        _count: {
          select: { subjects: true }
        }
      }
    });

    // If database has departments, return them
    if (dbDepartments.length > 0) {
      return NextResponse.json({ 
        departments: dbDepartments.map(d => ({
          id: d.id,
          code: d.code,
          name: d.name,
          description: d.description,
          icon: d.icon || '📚',
          color: d.color || '#3B82F6',
          subjectCount: d._count.subjects,
        }))
      });
    }

    // Otherwise return static departments
    return NextResponse.json({ departments: DEPARTMENTS });
  } catch (error) {
    console.error('Error fetching departments:', error);
    // Fallback to static data
    return NextResponse.json({ departments: DEPARTMENTS });
  }
}
