import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [students, streams, subjects, scores] = await Promise.all([
      prisma.student.count(),
      prisma.classStream.count(),
      prisma.subject.count(),
      prisma.score.findMany({
        include: { student: true, subject: true }
      })
    ]);

    const totalMarks = scores.reduce((sum, s) => sum + s.total, 0);
    const averagePerformance = scores.length > 0 ? totalMarks / scores.length : 0;

    const studentPerformance = await prisma.student.findMany({
      include: {
        scores: true
      }
    });

    const studentAverages = studentPerformance.map(student => ({
      name: student.name,
      average: student.scores.length > 0 
        ? student.scores.reduce((sum, s) => sum + s.total, 0) / student.scores.length 
        : 0
    }));

    const topPerformer = studentAverages.sort((a, b) => b.average - a.average)[0];

    return NextResponse.json({
      students,
      streams,
      subjects,
      totalScores: scores.length,
      averagePerformance: averagePerformance.toFixed(2),
      topPerformer
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}