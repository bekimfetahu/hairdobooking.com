import PageShell from "@/components/layouts/PageShell";
import SalonClient from "@/components/salon/SalonClient";
import SalonHeader from "@/components/salon/SalonHeader";
import { sendRequest } from "@/services/sendRequest";
import { notFound } from "next/navigation";

export default async function SalonPage({ params, searchParams }) {
  const { slug } = await params;
  const { preview_token } = (await searchParams) || {};

  if (!slug) {
    console.warn("[SalonPage] missing slug param, returning 404");
    notFound();
  }

  let salon = null;
  
  // Only SSR for public approved salons (no preview token)
  // Preview salons don't need SEO optimization, so skip SSR entirely
  // and let the client component fetch with the preview token
  if (!preview_token) {
    try {
      console.log(`[SalonPage] SSR fetching public salon: ${slug}`);
      salon = await sendRequest({
        method: "get",
        access_type: "laravelApp",
        api: `client/salons/${slug}`,
        data: {},
      });
    } catch (err) {
      console.warn(`[SalonPage] SSR fetch failed for ${slug}:`, err.message);
      // If the server-side fetch fails, render the page and let the client component fallback to a client-side fetch
      salon = null;
    }
  } else {
    console.log(`[SalonPage] Preview token detected, skipping SSR fetch. Token will be used client-side.`);
  }

  const title = salon?.venue?.name || "Salon";

  return (
    <PageShell 
      variant="dashboard" 
      customHeader={true}
      customHeaderContent={<SalonHeader salon={salon} />}
      contentClassName="mt-6"
    >
      <SalonClient slug={slug} initialSalon={salon} previewToken={preview_token || null} />
    </PageShell>
  );
}
