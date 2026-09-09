const https = require('https');
const bcrypt = require('bcryptjs');

const NEON_HOST = 'ep-muddy-math-aeqfkwpn.c-2.us-east-2.aws.neon.tech';
const CONN_STR = `postgresql://neondb_owner:npg_SwidG35QXDWx@${NEON_HOST}/neondb`;

function neonQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: NEON_HOST, path: '/sql', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': CONN_STR, 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        else resolve(JSON.parse(data));
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function main() {
  console.log('Seeding Neon DB...');
  const hash = await bcrypt.hash('Admin@123456', 10);
  await neonQuery(`INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt") VALUES ('admin_001', 'Admin', 'admin@careerai.com', '${hash}', 'ADMIN', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET "passwordHash" = '${hash}', role = 'ADMIN'`);
  console.log('Admin user: admin@careerai.com / Admin@123456');

  const careers = [
    ['career_swe','Software Engineer','software-engineer','Technology','Design, develop and maintain software.','$80K-$180K','Very High','Entry / Mid','Build scalable applications and systems.','CS degree','{"LOGICAL":70,"QUANTITATIVE":65,"VERBAL":60,"ANALYTICAL":75,"PROBLEM_SOLVING":80}'],
    ['career_ds','Data Scientist','data-scientist','Technology','Analyze complex data for insights.','$90K-$200K','Very High','Mid / Senior','Extract insights from datasets using ML.','Math/Stats/CS degree','{"LOGICAL":75,"QUANTITATIVE":80,"VERBAL":60,"ANALYTICAL":85,"PROBLEM_SOLVING":75}'],
    ['career_pm','Product Manager','product-manager','Business','Lead product strategy and execution.','$100K-$220K','High','Mid / Senior','Define product vision and roadmap.','Business/Engineering degree','{"LOGICAL":65,"QUANTITATIVE":60,"VERBAL":80,"ANALYTICAL":75,"PROBLEM_SOLVING":70}'],
    ['career_ux','UX Designer','ux-designer','Design','Create intuitive user experiences.','$70K-$150K','High','Entry / Mid','Research and prototype user interfaces.','Design/HCI degree','{"LOGICAL":60,"QUANTITATIVE":50,"VERBAL":75,"ANALYTICAL":70,"PROBLEM_SOLVING":65}'],
    ['career_dv','DevOps Engineer','devops-engineer','Technology','Bridge dev and ops for deployments.','$85K-$180K','Very High','Mid / Senior','Automate CI/CD and manage cloud infra.','CS/Engineering degree','{"LOGICAL":75,"QUANTITATIVE":65,"VERBAL":55,"ANALYTICAL":70,"PROBLEM_SOLVING":80}'],
  ];
  for (const [id,title,slug,cat,desc,salary,demand,exp,overview,edu,apt] of careers) {
    await neonQuery(`INSERT INTO "Career" (id,title,slug,category,description,"salaryRange","demandLevel","experienceLevel",overview,"educationReqs","aptitudeReqs","commonJobTitles","createdAt","updatedAt") VALUES ('${id}','${title}','${slug}','${cat}','${desc}','${salary}','${demand}','${exp}','${overview}','${edu}','${apt}'::jsonb,ARRAY[]::text[],NOW(),NOW()) ON CONFLICT (slug) DO NOTHING`);
    console.log('Career: ' + title);
  }

  const r = await neonQuery('SELECT (SELECT COUNT(*) FROM "User") as users, (SELECT COUNT(*) FROM "Career") as careers');
  console.log('DB Summary:', r.rows[0]);
  console.log('Seed complete!');
}
main().catch(e => { console.error(e.message); process.exit(1); });
