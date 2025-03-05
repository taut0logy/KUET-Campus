"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Routine } from "@/components/schedules/Routine";
import useAuthStore from "@/stores/auth-store";
import useRoutineStore from "@/stores/routine-store";
import { toast } from "sonner";

export default function RoutinePage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [weekday, setWeekday] = useState("");
  const [periods, setPeriods] = useState(Array(9).fill(""));
  const [newCourse, setNewCourse] = useState({
    courseId: "",
    courseName: "",
    classTest: "class"
  });
  
  const { user } = useAuthStore();
  const { 
    courses, 
    weeklySchedule, 
    loading, 
    error,
    fetchCourses, 
    fetchWeeklySchedule,
    addCourse,
    setWeeklySchedule 
  } = useRoutineStore();

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchWeeklySchedule();
    }
  }, [user, fetchCourses, fetchWeeklySchedule]);

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
        classTest: "class"
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowScheduleModal(true)}>Set Weekly Schedule</Button>
          <Button onClick={() => setShowCourseModal(true)}>Add Course</Button>
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
          <Routine />
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
                  value={newCourse.classTest}
                  onChange={(e) => setNewCourse({...newCourse, classTest: e.target.value})}
                >
                  <option value="class">Class</option>
                  <option value="test">Test</option>
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
    </div>
  );
}
