import ProfileForm from '@/components/account/ProfileForm';
import AuthPageShell from '@/components/layouts/AuthPageShell';
import { getCurrentUserServer } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUserServer();
  if (!user) {
    // Redirect to unified auth page and preserve return path via `returnUrl`
    redirect(`/auth?returnUrl=${encodeURIComponent('/profile')}`);
  }

  const me = user;
  console.log(JSON.stringify(me));

  const initial = {
    first_name: me.client?.first_name || me.first_name || '',
    last_name: me.client?.last_name || me.last_name || '',
    phone: me.client?.phone || '',
    avatar_url: me.avatar || null,
  };

  return (
    <AuthPageShell title="Profile">
      <div className="p-6 w-full max-w-2xl">
        <ProfileForm initial={initial} />
      </div>
    </AuthPageShell>
  );
}
