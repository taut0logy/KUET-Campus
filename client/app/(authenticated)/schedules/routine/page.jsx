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
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Check, ChevronDown, X, Calendar, BookOpen, Clock, LayoutGrid, Beaker } from "lucide-react";
import Image from "next/image";

export default function RoutinePage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [weekday, setWeekday] = useState("");
  const [periods, setPeriods] = useState(Array(9).fill(""));
  const [viewMode, setViewMode] = useState("routine");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");
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

  // Filter exams based on selected course
  const filteredExams = selectedCourseFilter 
    ? exams.filter(exam => {
        const course = courses.find(c => c.id === exam.courseId);
        return course && course.courseId === selectedCourseFilter;
      })
    : exams;

  // Filter weekly schedule based on selected course
  const filteredWeeklySchedule = selectedCourseFilter
    ? Object.entries(weeklySchedule || {}).reduce((filtered, [day, schedule]) => {
        // Check if any period contains the selected course
        const hasCourse = Object.values(schedule).some(periodCourse => periodCourse === selectedCourseFilter);
        if (hasCourse) {
          filtered[day] = schedule;
        }
        return filtered;
      }, {})
    : weeklySchedule;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Academic Schedules</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border">
            <Label htmlFor="view-mode" className={`${viewMode === "routine" ? "font-bold text-primary" : ""} transition-colors duration-200`}>Routine</Label>
            <Switch 
              id="view-mode" 
              checked={viewMode === "exams"} 
              onCheckedChange={(checked) => setViewMode(checked ? "exams" : "routine")} 
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="view-mode" className={`${viewMode === "exams" ? "font-bold text-primary" : ""} transition-colors duration-200`}>Exams</Label>
          </div>

          {/* Course Filter Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                Filter by course
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2">
                <div className="font-medium text-sm mb-2">Select Course</div>
                <div className="space-y-1 max-h-60 overflow-auto">
                  <div 
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors duration-200 ${!selectedCourseFilter ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedCourseFilter("")}
                  >
                    <span>All Courses</span>
                    {!selectedCourseFilter && <Check className="h-4 w-4" />}
                  </div>
                  {courses.map((course) => (
                    <div 
                      key={course.id} 
                      className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors duration-200 ${selectedCourseFilter === course.courseId ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedCourseFilter(course.courseId)}
                    >
                      <span>{course.courseId} - {course.courseName}</span>
                      {selectedCourseFilter === course.courseId && <Check className="h-4 w-4" />}
                    </div>
                  ))}
                </div>
                {selectedCourseFilter && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 flex items-center justify-center gap-1 hover:bg-destructive/10 transition-colors duration-200"
                    onClick={() => setSelectedCourseFilter("")}
                  >
                    <X className="h-3 w-3" /> Clear filter
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {viewMode === "routine" ? (
            <>
              <Button 
                onClick={() => setShowScheduleModal(true)}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Set Weekly Schedule
              </Button>
              <Button 
                onClick={() => setShowCourseModal(true)}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setShowExamModal(true)}
              className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <Clock className="mr-2 h-4 w-4" />
              Add Exam
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Active courses in the system</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Days</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklySchedule ? Object.keys(weeklySchedule).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Days with scheduled classes</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
            <LayoutGrid className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">Periods per day</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className={`h-2 w-2 rounded-full ${loading ? "bg-amber-500" : error ? "bg-destructive" : "bg-green-500"}`}></div>
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
        <Card className="col-span-7 shadow-md hover:shadow-lg transition-all duration-300">
          {selectedCourseFilter && (
            <div className="px-6 pt-6 pb-2 flex items-center">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Filtered by: {selectedCourseFilter}
              </div>
            </div>
          )}
          {viewMode === "routine" ? (
            <Routine weeklySchedule={filteredWeeklySchedule} />
          ) : (
            <ExamList 
              exams={filteredExams} 
              courses={courses} 
              onEdit={handleEditExam} 
              onDelete={handleDeleteExam} 
            />
          )}
        </Card>
      </div>

      {/* Set Weekly Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-background p-6 rounded-lg w-full max-h-[90vh] overflow-auto shadow-xl border border-border dark:border-primary/20 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Set Weekly Schedule</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-muted transition-all duration-300 hover:scale-110"
                onClick={() => setShowScheduleModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 bg-muted/50 rounded-l-md">Weekday</th>
                    {Array.from({ length: 9 }, (_, i) => (
                      <th key={i} className="p-2 bg-muted/50 text-center">Period {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">
                      <select
                        className="w-full border p-2 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-background text-foreground"
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
                          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-background text-foreground"
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
                              {course.courseId} - {course.courseName}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button 
                onClick={handleSetSchedule}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                disabled={!weekday}
              >
                Save Schedule
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowScheduleModal(false)}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-background p-6 rounded-lg w-full max-w-md shadow-xl border border-border dark:border-primary/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Add New Course</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-muted transition-all duration-300 hover:scale-110"
                onClick={() => setShowCourseModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-foreground/80">Course ID</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-background/50 shadow-sm"
                  value={newCourse.courseId}
                  onChange={(e) => setNewCourse({...newCourse, courseId: e.target.value})}
                  placeholder="E.g., CSE101"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter a unique identifier for this course</p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-foreground/80">Course Name</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-background/50 shadow-sm"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                  placeholder="E.g., Introduction to Computer Science"
                />
                <p className="text-xs text-muted-foreground mt-1">Full name of the course as it appears in your curriculum</p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-foreground/80">Course Type</label>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="theory"
                      name="courseType"
                      value="theory"
                      checked={newCourse.courseType === "theory"}
                      onChange={() => setNewCourse({...newCourse, courseType: "theory"})}
                      className="mr-2 h-4 w-4 accent-primary"
                    />
                    <label htmlFor="theory" className="cursor-pointer">Theory</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="lab"
                      name="courseType"
                      value="lab"
                      checked={newCourse.courseType === "lab"}
                      onChange={() => setNewCourse({...newCourse, courseType: "lab"})}
                      className="mr-2 h-4 w-4 accent-primary"
                    />
                    <label htmlFor="lab" className="cursor-pointer">Lab</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCourseModal(false)}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddCourse}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-gradient-to-r from-primary to-primary/80"
                disabled={!newCourse.courseId || !newCourse.courseName}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Save Course
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-background p-6 rounded-lg w-full max-w-md shadow-xl border border-border dark:border-primary/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {editingExam ? "Edit Exam" : "Add New Exam"}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-muted transition-all duration-300 hover:scale-110"
                onClick={() => {
                  setShowExamModal(false);
                  setEditingExam(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-foreground/80">Course</label>
                <select
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-background/50 shadow-sm"
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
                <p className="text-xs text-muted-foreground mt-1">Select the course this exam belongs to</p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-foreground/80">Exam Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {["class-test", "term-final", "lab-test"].map((type) => (
                    <div 
                      key={type}
                      onClick={() => setNewExam({...newExam, examType: type})}
                      className={`
                        p-3 rounded-md border cursor-pointer transition-all duration-200
                        flex flex-col items-center justify-center text-center
                        ${newExam.examType === type 
                          ? "border-primary bg-primary/10 shadow-sm" 
                          : "border-muted hover:border-primary/30 hover:bg-primary/5"}
                      `}
                    >
                      <div className="mb-1">
                        {type === "class-test" && <BookOpen className="h-5 w-5 text-blue-500" />}
                        {type === "term-final" && <Calendar className="h-5 w-5 text-red-500" />}
                        {type === "lab-test" && <Beaker className="h-5 w-5 text-green-500" />}
                      </div>
                      <span className="text-sm capitalize">
                        {type.split('-').join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-foreground/80">Exam Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-background/50 shadow-sm"
                  value={newExam.examDate}
                  onChange={(e) => setNewExam({...newExam, examDate: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">When will this exam take place?</p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-foreground/80">Syllabus</label>
                <textarea
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-background/50 shadow-sm"
                  value={newExam.syllabus}
                  onChange={(e) => setNewExam({...newExam, syllabus: e.target.value})}
                  placeholder="Enter topics covered in this exam..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">Optional: List the topics that will be covered</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowExamModal(false);
                  setEditingExam(null);
                }}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddExam}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-gradient-to-r from-primary to-primary/80"
                disabled={!newExam.courseId || !newExam.examDate}
              >
                {editingExam ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Exam
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Save Exam
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
