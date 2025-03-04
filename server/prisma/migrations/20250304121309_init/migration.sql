-- CreateTable
CREATE TABLE "routines" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "period1" TEXT,
    "period2" TEXT,
    "period3" TEXT,
    "period4" TEXT,
    "period5" TEXT,
    "period6" TEXT,
    "period7" TEXT,
    "period8" TEXT,
    "period9" TEXT,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "classTest" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "routines_weekday_userId_key" ON "routines"("weekday", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_courseId_key" ON "courses"("courseId");

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
