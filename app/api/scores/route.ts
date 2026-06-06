import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateGrade, updateRankings } from '@/lib/calculations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, subjectId, examScore, caScore, term, year } = body;
    
    const existing = await prisma.score.findUnique({
      where: {
        studentId_subjectId_term_year: {
          studentId,
          subjectId,
          term,
          year
        }
      }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Score already exists for this student, subject, term, and year' },
        { status: 409 }
      );
    }
    
    const total = examScore + caScore;
    const grade = await calculateGrade(total);
    
    const score = await prisma.score.create({
      data: {
        studentId,
        subjectId,
        examScore,
        caScore,
        total,
        grade,
        term,
        year
      },
      include: {
        student: true,
        subject: true
      }
    });
    
    await updateRankings(subjectId, term, year);
    
    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const subjectId = searchParams.get('subjectId');
  const streamId = searchParams.get('streamId');
  
  let where: any = {};
  if (studentId) where.studentId = studentId;
  if (subjectId) where.subjectId = subjectId;
  if (streamId) {
    where.student = { streamId };
  }
  
  const scores = await prisma.score.findMany({
    where,
    include: {
      student: { include: { stream: true } },
      subject: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json(scores);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, examScore, caScore } = body;
    
    const total = examScore + caScore;
    const grade = await calculateGrade(total);
    
    const score = await prisma.score.update({
      where: { id },
      data: { examScore, caScore, total, grade }
    });
    
    await updateRankings(score.subjectId, score.term, score.year);
    
    return NextResponse.json(score);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
  }
}
