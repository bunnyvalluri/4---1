import { spawn } from 'child_process';
import path from 'path';

export interface PythonRecommenderResult {
  careerId: string;
  title: string;
  category: string;
  matchScore: number;
  skillScore: number;
  aptitudeScore: number;
  semanticScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  factors: {
    name: string;
    score: number;
    weight: number;
    insight: string;
  }[];
  reasoning: string;
}

export interface PythonBridgeResponse {
  success: boolean;
  engine: string;
  results: PythonRecommenderResult[];
  error?: string;
}

import fs from 'fs';

export class PythonRecommenderBridge {
  private static getScriptPath(): string {
    const direct = path.resolve(process.cwd(), 'backend', 'ml', 'career_recommender.py');
    if (fs.existsSync(direct)) return direct;
    return path.resolve(process.cwd(), '..', 'backend', 'ml', 'career_recommender.py');
  }

  public static async runInference(candidate: any, careers: any[]): Promise<PythonBridgeResponse | null> {
    return new Promise((resolve) => {
      try {
        const payload = JSON.stringify({ candidate, careers });
        const scriptPath = this.getScriptPath();
        const pythonProcess = spawn('python', [scriptPath, '--stdin']);

        let stdoutData = '';
        let stderrData = '';

        const timeout = setTimeout(() => {
          pythonProcess.kill();
          resolve(null); // Fallback to TypeScript engine on timeout
        }, 3500);

        pythonProcess.stdout.on('data', (data) => {
          stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0 && stdoutData.trim()) {
            try {
              const parsed = JSON.parse(stdoutData.trim());
              resolve(parsed);
            } catch (err) {
              console.warn('[PythonBridge] JSON parse error:', err);
              resolve(null);
            }
          } else {
            console.warn('[PythonBridge] Process exited with code', code, stderrData);
            resolve(null);
          }
        });

        pythonProcess.on('error', (err) => {
          clearTimeout(timeout);
          console.warn('[PythonBridge] Python execution error, falling back to TS engine:', err.message);
          resolve(null);
        });

        // Write payload to stdin and close
        pythonProcess.stdin.write(payload);
        pythonProcess.stdin.end();
      } catch (err) {
        console.warn('[PythonBridge] Invocation exception:', err);
        resolve(null);
      }
    });
  }
}
