import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').max(150, 'Email cannot exceed 150 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password cannot exceed 128 characters'),
});

export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(150),
  password: z.string().min(1, 'Password is required').max(128),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(2000).optional(),
  degree: z.string().trim().max(100).optional(),
  branch: z.string().trim().max(100).optional(),
  college: z.string().trim().max(150).optional(),
  gradYear: z.coerce.number().min(1950).max(2100).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  interests: z.array(z.string().trim().max(100)).max(30).optional(),
  preferredIndustries: z.array(z.string().trim().max(100)).max(20).optional(),
  preferredRoles: z.array(z.string().trim().max(100)).max(20).optional(),
  preferredLocations: z.array(z.string().trim().max(100)).max(20).optional(),
  careerGoals: z.string().trim().max(2000).optional(),
  workExperienceYears: z.coerce.number().min(0).max(60).optional(),
  githubUrl: z.string().trim().max(250).optional(),
  linkedinUrl: z.string().trim().max(250).optional(),
  portfolioUrl: z.string().trim().max(250).optional(),
});

export const SubmitAptitudeSchema = z.object({
  answers: z.record(z.string().max(100), z.number().min(0).max(10)), // questionId -> selectedOption (0-3)
});

export const UpdateUserSkillsSchema = z.object({
  skills: z.array(
    z.object({
      skillId: z.string().max(100),
      proficiency: z.number().min(1).max(5),
    })
  ).max(200),
});
