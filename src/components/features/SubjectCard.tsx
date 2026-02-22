'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight } from 'lucide-react';
import type { Subject } from '@/types';
import { useAppStore } from '@/lib/store';

interface SubjectCardProps {
  subject: Subject;
  departmentColor?: string;
}

export function SubjectCard({ subject, departmentColor = '#3B82F6' }: SubjectCardProps) {
  const setSelectedSubject = useAppStore((state) => state.setSelectedSubject);

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
      onClick={() => setSelectedSubject(subject)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: departmentColor }}
            >
              {subject.code.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {subject.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {subject.code}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Semester {subject.semester}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{subject.resourceCount || 0}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
