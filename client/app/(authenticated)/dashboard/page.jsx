"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/auth-store";
import { toast } from "sonner";

export default function RoutinePage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [weekday, setWeekday] = useState("");
  const [periods, setPeriods] = useState(Array(9).fill(""));
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    courseId: "",
    courseName: "",
    classTest: "class"
  });
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/v1/get-courses", {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSetSchedule = async () => {
    try {
      const response = await fetch("/api/v1/set-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          weekday,
          period1: periods[0],
          period2: periods[1],
          period3: periods[2],
          period4: periods[3],
          period5: periods[4],
          period6: periods[5],
          period7: periods[6],
          period8: periods[7],
          period9: periods[8],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set schedule");
      }

      toast.success("Schedule set successfully");
      setShowScheduleModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddCourse = async () => {
    try {
      const response = await fetch("/api/v1/add-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        throw new Error("Failed to add course");
      }

      toast.success("Course added successfully");
      setShowCourseModal(false);
      fetchCourses();
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
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setShowScheduleModal(true)}>Set Weekly Schedule</Button>
        <Button onClick={() => setShowCourseModal(true)}>Add Course</Button>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
            <h2 className="text-lg font-bold mb-4">Set Weekly Schedule</h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Weekday</th>
                  {Array.from({ length: 9 }, (_, i) => (
                    <th key={i}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <select
                      className="border p-1 rounded"
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
                    <td key={index}>
                      <select
                        className="border p-1 rounded"
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
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
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
              <Button 
                variant="ghost" 
                onClick={() => setShowCourseModal(false)}
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