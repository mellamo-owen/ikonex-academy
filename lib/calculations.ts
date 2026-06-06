import prisma from './prisma';

export async function calculateGrade(total: number) {
  const scale = await prisma.gradingScale.findFirst({
    where: {
      minScore: { lte: total },
      maxScore: { gte: total }
    }
  });
  return scale?.grade || 'F';
}

export async function updateRankings(subjectId: string, term: string, year: number) {
  const scores = await prisma.score.findMany({
    where: { subjectId, term, year },
    include: { student: { include: { stream: true } } },
    orderBy: { total: 'desc' }
  });
  
  const streamsMap = new Map();
  scores.forEach(score => {
    const streamId = score.student.streamId;
    if (!streamsMap.has(streamId)) streamsMap.set(streamId, []);
    streamsMap.get(streamId).push(score);
  });
  
  for (const [streamId, streamScores] of streamsMap) {
    let position = 1;
    for (let i = 0; i < streamScores.length; i++) {
      if (i > 0 && streamScores[i].total < streamScores[i-1].total) {
        position = i + 1;
      }
      await prisma.score.update({
        where: { id: streamScores[i].id },
        data: { position }
      });
    }
  }
}