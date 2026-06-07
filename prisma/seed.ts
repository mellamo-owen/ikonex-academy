import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const gradingScales = [
    { minScore: 80, maxScore: 100, grade: 'A', remark: 'Excellent' },
    { minScore: 70, maxScore: 79, grade: 'B', remark: 'Very Good' },
    { minScore: 60, maxScore: 69, grade: 'C', remark: 'Good' },
    { minScore: 50, maxScore: 59, grade: 'D', remark: 'Pass' },
    { minScore: 40, maxScore: 49, grade: 'E', remark: 'Below Average' },
    { minScore: 0, maxScore: 39, grade: 'F', remark: 'Fail' },
  ]

  for (const scale of gradingScales) {
    await prisma.gradingScale.upsert({
      where: { grade: scale.grade },
      update: {},
      create: scale,
    })
  }

  console.log('Database seeded successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())