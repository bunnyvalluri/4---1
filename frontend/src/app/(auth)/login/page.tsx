import { AuthCard } from '@/components/auth/AuthCard';

export const metadata = {
  title: 'Sign In | CareerAI Platform',
  description: 'Access your explainable career matches, skill gaps, and interactive roadmaps.',
};

export default function LoginPage() {
  return <AuthCard initialMode="login" />;
}
