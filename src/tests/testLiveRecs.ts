import { RecommendationEngine } from '../lib/recommendationEngine';
import { prisma } from '../lib/db';

async function main() {
  console.log('Finding demo user...');
  const user = await prisma.user.findFirst({ where: { email: 'alex@example.com' } });
  if (!user) {
    console.error('Demo user not found');
    process.exit(1);
  }
  console.log('Found user:', user.name, user.id);

  console.log('Generating recommendations with new engine...');
  const start = Date.now();
  const recs = await RecommendationEngine.generateUserRecommendations(user.id);
  const elapsed = Date.now() - start;

  console.log(`Generated ${recs.length} recommendations in ${elapsed}ms!`);
  console.log(`Top match: ${recs[0].careerTitle} (${recs[0].matchScore}%, confidence: ${recs[0].confidenceScore}%)`);
  console.log(`Reasoning: ${recs[0].reasoning}`);
  console.log(`Contributing factors:`);
  for (const f of recs[0].breakdown.contributingFactors) {
    console.log(`  - ${f.name}: ${f.score}% (+${f.weightedPoints} pts, weight: ${f.weightPercent}%) [${f.status}]`);
    console.log(`    Insight: ${f.insight}`);
  }
  console.log('Done!');
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
