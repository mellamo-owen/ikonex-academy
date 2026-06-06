import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Get all reports summary
export async function GET() {
  try {
    const [students, streams, scores] = await Promise.all([
      prisma.student.findMany({
        include: {
          stream: true,
          scores: true
        }
      }),
      prisma.classStream.findMany({
        include: {
          students: {
            include: {
              scores: true
            }
          }
        }
      }),
      prisma.score.findMany()
    ]);

    const reportSummary = {
      totalStudents: students.length,
      totalStreams: streams.length,
      totalScores: scores.length,
      averagePerformance: scores.length > 0 
        ? scores.reduce((sum, s) => sum + s.total, 0) / scores.length 
        : 0,
      streams: streams.map(stream => ({
        id: stream.id,
        name: stream.name,
        studentCount: stream.students.length,
        averageScore: stream.students.length > 0
          ? stream.students.reduce((sum, student) => {
              const studentTotal = student.scores.reduce((s, score) => s + score.total, 0);
              return sum + (student.scores.length > 0 ? studentTotal / student.scores.length : 0);
            }, 0) / stream.students.length
          : 0
      })),
      topPerformers: students
        .map(student => ({
          id: student.id,
          name: student.name,
          admissionNo: student.admissionNo,
          stream: student.stream?.name,
          average: student.scores.length > 0
            ? student.scores.reduce((sum, s) => sum + s.total, 0) / student.scores.length
            : 0
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10)
    };

    return NextResponse.json(reportSummary);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch report summary' }, { status: 500 });
  }
}

// Generate class performance report PDF
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, type } = body;

    if (type === 'class' && streamId) {
      const stream = await prisma.classStream.findUnique({
        where: { id: streamId },
        include: {
          students: {
            include: {
              scores: {
                include: { subject: true }
              }
            }
          }
        }
      });

      if (!stream) {
        return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
      }

      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text('IKONEX ACADEMY', 105, 25, { align: 'center' });

      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text('Class Performance Report', 105, 38, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`${stream.name}`, 105, 50, { align: 'center' });

      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(1);
      doc.line(20, 55, 190, 55);

      // Calculate class statistics
      let totalMarks = 0;
      let totalScores = 0;
      let gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

      const studentData = stream.students.map(student => {
        const studentTotal = student.scores.reduce((sum, s) => sum + s.total, 0);
        const studentAvg = student.scores.length > 0 ? studentTotal / student.scores.length : 0;
        
        totalMarks += studentTotal;
        totalScores += student.scores.length;
        
        let grade = 'F';
        if (studentAvg >= 80) { grade = 'A'; gradeCount.A++; }
        else if (studentAvg >= 70) { grade = 'B'; gradeCount.B++; }
        else if (studentAvg >= 60) { grade = 'C'; gradeCount.C++; }
        else if (studentAvg >= 50) { grade = 'D'; gradeCount.D++; }
        else if (studentAvg >= 40) { grade = 'E'; gradeCount.E++; }
        else { gradeCount.F++; }
        
        return [
          student.admissionNo,
          student.name,
          studentTotal.toString(),
          studentAvg.toFixed(2) + '%',
          grade
        ];
      }).sort((a, b) => parseFloat(b[3]) - parseFloat(a[3]));

      const classAverage = totalScores > 0 ? totalMarks / totalScores : 0;
      const passCount = gradeCount.A + gradeCount.B + gradeCount.C + gradeCount.D;
      const passRate = stream.students.length > 0 ? (passCount / stream.students.length) * 100 : 0;

      // Student table
      (doc as any).autoTable({
        startY: 65,
        head: [['Admission No', 'Student Name', 'Total Marks', 'Average', 'Grade']],
        body: studentData,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 50 },
          2: { cellWidth: 25, align: 'center' },
          3: { cellWidth: 25, align: 'center' },
          4: { cellWidth: 20, align: 'center' }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;

      // Summary
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Students: ${stream.students.length}`, 20, finalY);
      doc.text(`Class Average: ${classAverage.toFixed(2)}%`, 20, finalY + 8);
      doc.text(`Pass Rate: ${passRate.toFixed(2)}%`, 20, finalY + 16);
      doc.text(`Top Performer: ${studentData[0]?.[1] || 'N/A'}`, 20, finalY + 24);

      // Grade distribution
      const gradeY = finalY + 40;
      doc.text('Grade Distribution:', 20, gradeY);
      
      let xPos = 20;
      const grades = ['A', 'B', 'C', 'D', 'E', 'F'];
      grades.forEach(grade => {
        const count = gradeCount[grade as keyof typeof gradeCount];
        const percentage = stream.students.length > 0 ? (count / stream.students.length) * 100 : 0;
        doc.text(`${grade}: ${count} (${percentage.toFixed(1)}%)`, xPos, gradeY + 8);
        xPos += 45;
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by IKONEX Academy Management System', 105, 285, { align: 'center' });
      doc.text(new Date().toLocaleDateString(), 105, 292, { align: 'center' });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${stream.name}_class_report.pdf"`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}