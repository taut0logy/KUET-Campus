"use client";

import { useEffect } from 'react';
import useRoutineStore from '@/stores/routine-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const PERIODS = [
  'period1',
  'period2',
  'period3',
  'period4',
  'period5',
  'period6',
  'period7',
  'period8',
  'period9',
];

export function Routine({ weeklySchedule: filteredSchedule }) {
  const { weeklySchedule, loading, error, fetchWeeklySchedule } = useRoutineStore();
  
  // Use the filtered schedule if provided, otherwise use the one from the store
  const scheduleToDisplay = filteredSchedule || weeklySchedule;

  useEffect(() => {
    fetchWeeklySchedule();
  }, [fetchWeeklySchedule]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {WEEKDAYS.map((day) => (
              <div key={day} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="grid grid-cols-9 gap-2">
                  {PERIODS.map((period) => (
                    <Skeleton key={period} className="h-8" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  const currentDay = WEEKDAYS[today.getDay()];

  // If we have a filtered schedule with no days, show a message
  if (scheduleToDisplay && Object.keys(scheduleToDisplay).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No classes found for the selected course filter.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Routine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {WEEKDAYS.map((day) => {
            const schedule = scheduleToDisplay?.[day];
            const isToday = day === currentDay;

            // Skip days that don't have the filtered course
            if (!schedule) return null;

            return (
              <div
                key={day}
                className={`space-y-2 ${
                  isToday ? 'bg-accent/50 p-2 rounded-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{day}</h3>
                  {isToday && (
                    <span className="text-xs text-muted-foreground">
                      Today
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-9 gap-2">
                  {PERIODS.map((period) => {
                    const course = schedule?.[period];
                    return (
                      <div
                        key={period}
                        className={`p-2 rounded-md text-sm ${
                          course
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-muted'
                        }`}
                      >
                        {course || '-'}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 