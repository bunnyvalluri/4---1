import { AuthCard } from '@/components/auth/AuthCard';

export const metadata = {
  title: 'Create Account | CareerAI Platform',
  description: 'Start your personalized skill roadmap and career matching journey.',
};

export default function RegisterPage() {
  return <AuthCard initialMode="register" />;
}
