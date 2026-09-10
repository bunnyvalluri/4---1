import { redirect } from 'next/navigation';

export default function UserPortalRootPage() {
  redirect('/user/dashboard');
}
