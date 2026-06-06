-- CreateTable
CREATE TABLE "ClassStream" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "ClassStream" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StreamSubject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "streamId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StreamSubject_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "ClassStream" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StreamSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "examScore" INTEGER NOT NULL DEFAULT 0,
    "caScore" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "grade" TEXT,
    "position" INTEGER,
    "term" TEXT NOT NULL DEFAULT 'Term 1',
    "year" INTEGER NOT NULL DEFAULT 2026,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Score_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Score_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradingScale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minScore" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassStream_name_key" ON "ClassStream"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "Student"("admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StreamSubject_streamId_subjectId_key" ON "StreamSubject"("streamId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_studentId_subjectId_term_year_key" ON "Score"("studentId", "subjectId", "term", "year");

-- CreateIndex
CREATE UNIQUE INDEX "GradingScale_grade_key" ON "GradingScale"("grade");
