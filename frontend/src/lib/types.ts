import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  college: z.string().optional(),
  gradYear: z.coerce.number().optional(),
  cgpa: z.coerce.number().optional(),
  interests: z.array(z.string()).optional(),
  preferredIndustries: z.array(z.string()).optional(),
  preferredRoles: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  careerGoals: z.string().optional(),
  workExperienceYears: z.coerce.number().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

export const SubmitAptitudeSchema = z.object({
  answers: z.record(z.string(), z.number()), // questionId -> selectedOption (0-3)
});

export const UpdateUserSkillsSchema = z.object({
  skills: z.array(
    z.object({
      skillId: z.string(),
      proficiency: z.number().min(1).max(5),
    })
  ),
});
