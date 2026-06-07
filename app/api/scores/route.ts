import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateGrade, updateRankings } from '@/lib/calculations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, subjectId, examScore, caScore, term, year } = body;
    
    const existing = await prisma.score.findUnique({
      where: {
        studentId_subjectId_term_year: { studentId, subjectId, term, year }
      }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Duplicate score' }, { status: 409 });
    }
    
    const total = examScore + caScore;
    const grade = await calculateGrade(total);
    
    const score = await prisma.score.create({
      data: { studentId, subjectId, examScore, caScore, total, grade, term, year }
    });
    
    await updateRankings(subjectId, term, year);
    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  
  const scores = await prisma.score.findMany({
    where: studentId ? { studentId } : {},
    include: { student: { include: { stream: true } }, subject: true }
  });
  return NextResponse.json(scores);
}