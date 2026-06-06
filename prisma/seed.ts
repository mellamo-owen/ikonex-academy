import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  const gradingScales = [

    { minScore: 80, maxScore: 100, grade: 'A', remark: 'Excellent' },

    { minScore: 70, maxScore: 79, grade: 'B', remark: 'Very Good' },

    { minScore: 60, maxScore: 69, grade: 'C', remark: 'Good' },

    { minScore: 50, maxScore: 59, grade: 'D', remark: 'Pass' },

    { minScore: 40, maxScore: 49, grade: 'E', remark: 'Below Average' },

    { minScore: 0, maxScore: 39, grade: 'F', remark: 'Fail' },

  ];

  for (const scale of gradingScales) {

    await prisma.gradingScale.upsert({

      where: { grade: scale.grade },

      update: {},

      create: scale,

    });

  }

  const streams = [

    { name: 'Form 1A' }, { name: 'Form 1B' }, { name: 'Form 1C' },

    { name: 'Form 2A' }, { name: 'Form 2B' }, { name: 'Form 3A' }

  ];

  for (const stream of streams) {

    await prisma.classStream.upsert({

      where: { name: stream.name },

      update: {},

      create: stream,

    });

  }

  const subjects = [

    { name: 'Mathematics', code: 'MATH101' },

    { name: 'English', code: 'ENG101' },

    { name: 'Kiswahili', code: 'KIS101' },

    { name: 'Biology', code: 'BIO101' },

    { name: 'Chemistry', code: 'CHE101' },

    { name: 'Physics', code: 'PHY101' },

    { name: 'History', code: 'HIS101' },

    { name: 'Geography', code: 'GEO101' }

  ];

  for (const subject of subjects) {

    await prisma.subject.upsert({

      where: { code: subject.code },

      update: {},

      create: subject,

    });

  }

  console.log('Database seeded successfully');

}

main()

  .catch(console.error)

  .finally(() => prisma.$disconnect());
