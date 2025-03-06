"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

export function ExamList({ 
  exams, 
  courses, 
  onEdit, 
  onDelete 
}) {
  // Function to get the course code from the course ID
  const getCourseCode = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.courseId : "Unknown Course";
  };

  return (
    <CardContent className="pt-6">
      <h3 className="text-xl font-bold mb-4">Exam List</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map(exam => {
          const course = courses.find(c => c.id === exam.courseId);
          return (
            <Card key={exam.id} className="overflow-hidden">
              <CardHeader className="bg-primary/10 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{getCourseCode(exam.courseId)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{course?.courseName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(exam)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(exam.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-2">
                  <span className="text-xs font-medium bg-primary/20 px-2 py-1 rounded-full">
                    {exam.examType}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium">Date & Time:</p>
                  <p className="text-sm">{format(new Date(exam.examDate), 'PPP p')}</p>
                </div>
                {exam.syllabus && (
                  <div>
                    <p className="text-sm font-medium">Syllabus:</p>
                    <p className="text-sm line-clamp-3">{exam.syllabus}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {exams.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No exams scheduled. Click "Add Exam" to create one.
          </div>
        )}
      </div>
    </CardContent>
  );
} 