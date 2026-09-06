import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { prisma } from './db';

export interface ResumeAnalysisResult {
  atsScore: number;
  extractedSkills: string[];
  missingSkills: string[];
  formattingIssues: string[];
  weakBulletPoints: { original: string; issue: string; suggested: string }[];
  suggestedKeywords: string[];
  recommendations: string[];
  summary: string;
}

export class ResumeParserService {
  public static async extractTextFromBuffer(buffer: Buffer, fileType: string): Promise<string> {
    const mime = fileType.toLowerCase();
    if (mime.includes('pdf') || mime.endsWith('.pdf')) {
      try {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const textResult = await parser.getText();
        await parser.destroy();
        return textResult.text || '';
      } catch (err) {
        console.warn('PDF parsing error, falling back to string extraction:', err);
        return buffer.toString('utf-8');
      }
    } else if (
      mime.includes('docx') ||
      mime.includes('wordprocessingml') ||
      mime.endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } catch (err) {
        console.warn('DOCX parsing error, falling back to string extraction:', err);
        return buffer.toString('utf-8');
      }
    } else {
      // Plain text fallback
      return buffer.toString('utf-8');
    }
  }

  public static async analyzeResume(
    userId: string,
    fileName: string,
    rawText: string,
    careerId?: string
  ): Promise<ResumeAnalysisResult> {
    const text = rawText.trim();
    const textLower = text.toLowerCase();

    // 1. Fetch available skills to extract
    const allSkills = await prisma.skill.findMany();
    const extractedSkills: string[] = [];

    for (const s of allSkills) {
      // Word boundary regex for accurate skill matching
      const escaped = s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(text)) {
        extractedSkills.push(s.name);
      }
    }

    // 2. Formatting & Structure checks
    const formattingIssues: string[] = [];
    if (text.length < 300) {
      formattingIssues.push('Resume content is too brief (< 300 words). Add more details about your technical projects and achievements.');
    }
    if (!textLower.includes('@') && !textLower.includes('email')) {
      formattingIssues.push('No contact email address detected in the header.');
    }
    if (!textLower.includes('education') && !textLower.includes('degree') && !textLower.includes('university') && !textLower.includes('college')) {
      formattingIssues.push('Missing explicit "Education" or "Academic Credentials" section.');
    }
    if (!textLower.includes('project') && !textLower.includes('experience')) {
      formattingIssues.push('Missing dedicated "Projects" or "Work Experience" section.');
    }
    if (text.includes('•') || text.includes('-') || text.includes('*')) {
      // Has bullet points
    } else {
      formattingIssues.push('Lack of clear bullet points detected. ATS scanners parse standard bullet points significantly better than walls of text.');
    }

    // 3. Detect weak bullet points without metrics/action verbs
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 25);
    const weakBulletPoints: { original: string; issue: string; suggested: string }[] = [];

    const weakVerbs = ['worked on', 'helped with', 'responsible for', 'assisted in', 'handled', 'was part of'];
    const metricRegex = /(\d+%|\$\d+|\d+x|\d+\s*(users|clients|requests|ms|seconds|hours|queries|endpoints))/i;

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const hasWeakVerb = weakVerbs.find((wv) => lineLower.includes(wv));
      const hasMetric = metricRegex.test(line);

      if (hasWeakVerb) {
        weakBulletPoints.push({
          original: line.slice(0, 120),
          issue: `Uses passive phrasing ("${hasWeakVerb}") without ownership.`,
          suggested: `Architected and spearheaded the implementation, resulting in measurable efficiency gains.`,
        });
      } else if (!hasMetric && line.length > 40 && weakBulletPoints.length < 3) {
        weakBulletPoints.push({
          original: line.slice(0, 120),
          issue: 'Lacks quantifiable metric or business outcome.',
          suggested: `${line} — achieving a 25% reduction in processing latency across 5,000+ operations.`,
        });
      }

      if (weakBulletPoints.length >= 3) break;
    }

    // 4. Compare with Target Career if provided
    let careerTitle = 'General Tech Professional';
    let missingSkills: string[] = [];
    const suggestedKeywords: string[] = [];

    if (careerId) {
      const career = await prisma.career.findUnique({
        where: { id: careerId },
        include: { skills: { include: { skill: true } } },
      });

      if (career) {
        careerTitle = career.title;
        const requiredSkillNames = career.skills.map((cs) => cs.skill.name);
        missingSkills = requiredSkillNames.filter(
          (rs) => !extractedSkills.some((es) => es.toLowerCase() === rs.toLowerCase())
        );

        suggestedKeywords.push(...missingSkills.slice(0, 6));
        suggestedKeywords.push('CI/CD Pipelines', 'REST APIs', 'Unit Testing', 'Scalability');
      }
    } else {
      suggestedKeywords.push('Docker', 'PostgreSQL', 'TypeScript', 'Automated Testing', 'Git', 'Agile');
    }

    // 5. Calculate ATS Score (0-100)
    let score = 75; // baseline
    // Add points for skills detected
    score += Math.min(20, extractedSkills.length * 2);
    // Deduct for formatting issues
    score -= formattingIssues.length * 6;
    // Deduct for weak bullets
    score -= weakBulletPoints.length * 3;
    // Cap score between 35 and 96
    const atsScore = Math.max(35, Math.min(96, score));

    // 6. Actionable recommendations
    const recommendations: string[] = [
      `Incorporate quantified achievements (e.g. percentages, latency improvements, user counts) into project descriptions.`,
      `Feature prominent keywords for your target role (${careerTitle}) such as: ${suggestedKeywords.slice(0, 4).join(', ')}.`,
      `Ensure each entry under Projects highlights your tech stack, system architecture, and verifiable GitHub/live links.`,
    ];

    const summary = `Resume scored ${atsScore}/100 for ${careerTitle}. Identified ${extractedSkills.length} technical competencies. Found ${formattingIssues.length} layout/ATS warnings and ${missingSkills.length} recommended industry keywords.`;

    // 7. Persist to Database
    await prisma.resumeAnalysis.create({
      data: {
        userId,
        careerId,
        fileName,
        atsScore,
        extractedSkills,
        missingSkills,
        formattingIssues,
        weakBulletPoints,
        suggestedKeywords,
        recommendations,
        summary,
      },
    });

    return {
      atsScore,
      extractedSkills,
      missingSkills,
      formattingIssues,
      weakBulletPoints,
      suggestedKeywords,
      recommendations,
      summary,
    };
  }
}
