import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const streams = await prisma.classStream.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
    return NextResponse.json(streams);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const stream = await prisma.classStream.create({
      data: { name: body.name }
    });
    return NextResponse.json(stream, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Stream already exists' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const stream = await prisma.classStream.update({
      where: { id: body.id },
      data: { name: body.name }
    });
    return NextResponse.json(stream);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await prisma.classStream.delete({ where: { id: id! } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}