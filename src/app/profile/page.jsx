
"use client";
import React, {useEffect, useState} from 'react';
import ProfileForm from '@/components/account/ProfileForm';
import AuthPageShell from '@/components/layouts/AuthPageShell';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function ProfilePage(){
  const [me, setMe] = useState(null);

    const router = useRouter();
      const user = useSelector((state) => state.auth.user);
      const displayName = user?.client?.first_name || user?.first_name || user?.name || 'there';

      console.log('ProfilePage user', user);

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setMe(d.user ?? d)).catch(()=>{}); }, []);

  function handleSaved(data){
    console.log('Profile saved, new data:', data);
    setMe(data);
    // optional: dispatch auth state update
    // alert('Profile saved');
  }

  if(!me) return <div className="p-6">Loading...</div>;

  const initial = {
    first_name: me.client?.first_name || me.first_name || '',
    last_name: me.client?.last_name || me.last_name || '',
    phone: me.client?.phone || '',
    avatar_url: me.avatar_url || (me.user && me.user.avatar_url) || me.client?.avatar_url || null,
  };

  return (
    <AuthPageShell title="Profile">
      <div className="p-6 w-full max-w-2xl">
        <ProfileForm initial={initial} onSaved={handleSaved} />
      </div>
    </AuthPageShell>
  );
}
