import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subject = await prisma.subject.create({
      data: {
        name: body.name,
        code: body.code
      }
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Subject code or name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const subject = await prisma.subject.update({
      where: { id: body.id },
      data: {
        name: body.name,
        code: body.code
      }
    });
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await prisma.subject.delete({ where: { id: id! } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
