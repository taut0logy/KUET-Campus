"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Routine } from "@/components/schedules/Routine";
import { ExamList } from "@/components/schedules/ExamList";
import useAuthStore from "@/stores/auth-store";
import useRoutineStore from "@/stores/routine-store";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function RoutinePage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [weekday, setWeekday] = useState("");
  const [periods, setPeriods] = useState(Array(9).fill(""));
  const [viewMode, setViewMode] = useState("routine");
  const [newCourse, setNewCourse] = useState({
    courseId: "",
    courseName: "",
    courseType: "theory"
  });
  const [newExam, setNewExam] = useState({
    courseId: "",
    examType: "class-test",
    syllabus: "",
    examDate: new Date().toISOString().split('T')[0]
  });
  const [editingExam, setEditingExam] = useState(null);
  
  const { user } = useAuthStore();
  const { 
    courses, 
    weeklySchedule, 
    loading, 
    error,
    fetchCourses, 
    fetchWeeklySchedule,
    addCourse,
    setWeeklySchedule,
    fetchExams,
    addExam,
    updateExam,
    deleteExam,
    exams
  } = useRoutineStore();

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setNewExam({
      courseId: exam.courseId,
      examType: exam.examType,
      syllabus: exam.syllabus || "",
      examDate: new Date(exam.examDate).toISOString().slice(0, 16)
    });
    setShowExamModal(true);
  };
  
  const handleDeleteExam = async (examId) => {
    try {
      await deleteExam(examId);
      toast.success("Exam deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchWeeklySchedule();
      fetchExams().then(exams => console.log('Fetched exams:', exams));
    }
  }, [user, fetchCourses, fetchWeeklySchedule, fetchExams]);

  const handleSetSchedule = async () => {
    try {
      await setWeeklySchedule(weekday, {
        period1: periods[0],
        period2: periods[1],
        period3: periods[2],
        period4: periods[3],
        period5: periods[4],
        period6: periods[5],
        period7: periods[6],
        period8: periods[7],
        period9: periods[8],
      });

      toast.success("Schedule set successfully");
      setShowScheduleModal(false);
      setWeekday("");
      setPeriods(Array(9).fill(""));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddCourse = async () => {
    try {
      await addCourse(newCourse);
      toast.success("Course added successfully");
      setShowCourseModal(false);
      setNewCourse({
        courseId: "",
        courseName: "",
        courseType: "theory"
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddExam = async () => {
    try {
      if (editingExam) {
        await updateExam(editingExam.id, newExam);
        toast.success("Exam updated successfully");
      } else {
        await addExam(newExam);
        toast.success("Exam added successfully");
      }
      setShowExamModal(false);
      setEditingExam(null);
      setNewExam({
        courseId: "",
        examType: "class-test",
        syllabus: "",
        examDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Academic Schedules</h2>
        <div className="flex gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-mode" className={viewMode === "routine" ? "font-bold" : ""}>Routine</Label>
            <Switch 
              id="view-mode" 
              checked={viewMode === "exams"} 
              onCheckedChange={(checked) => setViewMode(checked ? "exams" : "routine")} 
            />
            <Label htmlFor="view-mode" className={viewMode === "exams" ? "font-bold" : ""}>Exams</Label>
          </div>
          {viewMode === "routine" ? (
            <>
              <Button onClick={() => setShowScheduleModal(true)}>Set Weekly Schedule</Button>
              <Button onClick={() => setShowCourseModal(true)}>Add Course</Button>
            </>
          ) : (
            <Button onClick={() => setShowExamModal(true)}>Add Exam</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Active courses in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklySchedule ? Object.keys(weeklySchedule).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Days with scheduled classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">Periods per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "Loading..." : "Ready"}</div>
            <p className="text-xs text-muted-foreground">
              {error ? "Error loading data" : "System is operational"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          {viewMode === "routine" ? (
            <Routine />
          ) : (
            <ExamList 
              exams={exams} 
              courses={courses} 
              onEdit={handleEditExam} 
              onDelete={handleDeleteExam} 
            />
          )}
        </Card>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background p-4 rounded-lg w-full max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-bold mb-4">Set Weekly Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-2">Weekday</th>
                    {Array.from({ length: 9 }, (_, i) => (
                      <th key={i} className="p-2">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">
                      <select
                        className="w-full border p-1 rounded"
                        value={weekday}
                        onChange={(e) => setWeekday(e.target.value)}
                      >
                        <option value="">Select Day</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                      </select>
                    </td>
                    {periods.map((period, index) => (
                      <td key={index} className="p-2">
                        <select
                          className="w-full border p-1 rounded"
                          value={period}
                          onChange={(e) => {
                            const newPeriods = [...periods];
                            newPeriods[index] = e.target.value;
                            setPeriods(newPeriods);
                          }}
                        >
                          <option value="">Select Course</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.courseId}>
                              {course.courseName}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleSetSchedule}>Save</Button>
              <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Course ID</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={newCourse.courseId}
                  onChange={(e) => setNewCourse({...newCourse, courseId: e.target.value})}
                  placeholder="E.g., CSE101"
                />
              </div>
              <div>
                <label className="block mb-1">Course Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                  placeholder="E.g., Introduction to Computer Science"
                />
              </div>
              <div>
                <label className="block mb-1">Type</label>
                <select
                  className="w-full border p-2 rounded"
                  value={newCourse.courseType}
                  onChange={(e) => setNewCourse({...newCourse, courseType: e.target.value})}
                >
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleAddCourse}>Save</Button>
              <Button variant="ghost" onClick={() => setShowCourseModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {editingExam ? "Edit Exam" : "Add New Exam"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Course</label>
                <select
                  className="w-full border p-2 rounded"
                  value={newExam.courseId}
                  onChange={(e) => setNewExam({...newExam, courseId: e.target.value})}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.courseId}>
                      {course.courseName} ({course.courseId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Exam Type</label>
                <select
                  className="w-full border p-2 rounded"
                  value={newExam.examType}
                  onChange={(e) => setNewExam({...newExam, examType: e.target.value})}
                >
                  <option value="class-test">Class Test</option>
                  <option value="term-final">Term Final</option>
                  <option value="lab-test">Lab Test</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Exam Date</label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded"
                  value={newExam.examDate}
                  onChange={(e) => setNewExam({...newExam, examDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1">Syllabus</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={newExam.syllabus}
                  onChange={(e) => setNewExam({...newExam, syllabus: e.target.value})}
                  placeholder="Enter exam syllabus"
                  rows={4}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleAddExam}>
                {editingExam ? "Update" : "Save"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowExamModal(false);
                  setEditingExam(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
