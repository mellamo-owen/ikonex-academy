import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamId = searchParams.get('streamId');
  
  const students = await prisma.student.findMany({
    where: streamId ? { streamId } : {},
    include: {
      stream: true,
      scores: {
        include: { subject: true }
      }
    },
    orderBy: { admissionNo: 'asc' }
  });
  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const student = await prisma.student.create({
      data: {
        name: body.name,
        admissionNo: body.admissionNo,
        streamId: body.streamId
      },
      include: { stream: true }
    });
    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Admission number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const student = await prisma.student.update({
      where: { id: body.id },
      data: {
        name: body.name,
        streamId: body.streamId
      },
      include: { stream: true }
    });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await prisma.student.delete({ where: { id: id! } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
