// src/laravelApp/dashboard/page.js
'use client';

import { useSelector } from 'react-redux';

export default function DashboardPage() {
    const user = useSelector((state) => state.auth.user);

    return (
        <>
          <div>{JSON.stringify(user)}</div>
        </>
    );
}
