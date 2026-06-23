import PageShell from '@/components/layouts/PageShell';
import { sendRequest } from '@/services/sendRequest';

export const dynamic = 'force-dynamic';

export default async function PolicyPage({ params }) {
  const { slug } = await params;

  console.log('[PolicyPage] slug param:', slug);
  let policy = null;
  try {
    policy = await sendRequest({ method: 'get', access_type: 'laravelApp', api: `client/policies/${slug}`, data: {} });
  } catch (err) {
    // If the server-side fetch fails, render the page and let the client component fallback to a client-side fetch
    policy = null;
  }

  const policyObj = policy?.data ?? policy;
  const title = policyObj?.title || slug;
  const content = policyObj?.content || '';

  console.log('[PolicyPage] policy data:', policy);

  return (
    <PageShell title={title}>
      <div className="policy-body prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </PageShell>
  );
}
