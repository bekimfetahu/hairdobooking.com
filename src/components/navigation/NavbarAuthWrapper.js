/**
 * NavbarAuthWrapper - Server component that fetches auth data and passes to client component
 * This ensures NavbarStatic renders with user data immediately during SSR
 */

import { getCurrentUserServer } from '@/lib/auth-server';
import NavbarStatic from '@/components/navigation/NavbarStatic';

export default async function NavbarAuthWrapper() {
  const user = await getCurrentUserServer();

  return (
    <NavbarStatic initialUser={user} />
  );
}
