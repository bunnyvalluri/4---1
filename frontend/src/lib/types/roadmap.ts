export type RoadmapItemStatus = 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
export type RoadmapItemType = 'learning' | 'practice' | 'project' | 'assessment' | 'certification' | 'resume' | 'interview' | 'application';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type LearningPace = 'fast_track' | 'balanced' | 'flexible';

export interface RoadmapResourceLink {
  id: string;
  title: string;
  url: string;
  type: string;
  provider?: 'W3SCHOOLS' | 'GEEKSFORGEEKS' | string;
  topic?: string;
  skill?: string;
  skill_level?: string;
  resource_type?: string;
  description?: string;
  why_recommended?: string;
  is_verified?: boolean;
  is_completed?: boolean;
}

export interface RoadmapTask {
  id: string;
  text: string;
  done: boolean;
}

export interface RoadmapItemData {
  id: string;
  month: number;
  week_number?: number;
  sequence_number?: number;
  phase_id: string;
  title: string;
  description: string;
  item_type: RoadmapItemType;
  priority: PriorityLevel;
  status: RoadmapItemStatus;
  skills: string[];
  current_level?: string;
  target_level?: string;
  why_matters?: string;
  practice_task?: string;
  assignment?: {
    title: string;
    description: string;
    repoTemplate: string;
    verificationCriteria: string[];
  } | any;
  verification_type?: string;
  tasks: RoadmapTask[];
  estimated_hours: number;
  actual_hours: number;
  item_order: number;
  dependencies: string[];
  resource_links: RoadmapResourceLink[];
  project_id?: string | null;
  is_completed: boolean;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface CareerReadinessBreakdown {
  readiness_score: number;
  skill_coverage: number;
  assessment_fit: number;
  resume_evidence: number;
  project_readiness: number;
  roadmap_completion: number;
}

export interface RoadmapIntelligenceInfo {
  verified_skills_count: number;
  skill_gaps_count: number;
  assessment_fit_pct: number;
  resume_points_count: number;
  target_career: string;
}

export interface RoadmapPhaseData {
  id: string;
  month: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress_percent: number;
  target_skills: string[];
  items_count: number;
  completed_items_count: number;
}

export interface NextBestActionData {
  item_id?: string | null;
  title: string;
  phase_id?: string | null;
  priority: PriorityLevel;
  estimated_hours: number;
  estimated_minutes: number;
  reason: string;
  action_label: string;
  action_url: string;
}

export interface RoadmapData {
  id: string;
  user_id: string;
  career_id: string;
  career_title?: string;
  title: string;
  description: string;
  duration_months: number;
  progress_percent: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  version: number;
  hours_per_week: number;
  learning_pace: LearningPace;
  career_readiness_score: number;
  readiness_breakdown: CareerReadinessBreakdown;
  roadmap_intelligence: RoadmapIntelligenceInfo;
  estimated_total_hours: number;
  completed_hours: number;
  estimated_completion_date?: string | null;
  phases: RoadmapPhaseData[];
  milestones: Array<{ id: string; title: string; month: number; completed: boolean }>;
  items: RoadmapItemData[];
  next_best_action?: NextBestActionData | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapActivityItem {
  id: string;
  title: string;
  action: 'COMPLETED' | 'STARTED' | 'SKIPPED' | 'GENERATED' | 'REGENERATED';
  category: string;
  relative_time: string;
  timestamp: string;
}
