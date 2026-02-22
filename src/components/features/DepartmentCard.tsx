'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, FileText } from 'lucide-react';
import type { Department } from '@/types';
import { useAppStore } from '@/lib/store';

interface DepartmentCardProps {
  department: Department;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  const setSelectedDepartment = useAppStore((state) => state.setSelectedDepartment);

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      onClick={() => setSelectedDepartment(department)}
    >
      <div
        className="h-2 w-full"
        style={{ backgroundColor: department.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div
            className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110"
          >
            {department.icon}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
        <CardTitle className="text-lg font-bold">
          {department.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {department.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{department.subjectCount || '8+'} subjects</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{department.resourceCount || '50+'} resources</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: department.color }}
        >
          View Department
        </Button>
      </CardContent>
    </Card>
  );
}
