import PageShell from "@/components/layouts/PageShell";
import SalonClient from "@/components/salon/SalonClient";
import SalonHeader from "@/components/salon/SalonHeader";
import { SalonSliderProvider } from "@/context/SalonSliderContext";
import { sendRequest } from "@/services/sendRequest";
import { notFound } from "next/navigation";

export default async function SalonPage({ params }) {
  const { slug } = await params;
  if (!slug) {
    console.warn("[SalonPage] missing slug param, returning 404");
    notFound();
  }

  let salon = null;
  try {
    salon = await sendRequest({ method: "get", access_type: "laravelApp", api: `client/salons/${slug}`, data: {} });
  } catch (err) {
    // If the server-side fetch fails, render the page and let the client component fallback to a client-side fetch
    salon = null;
  }

  const title = salon?.venue?.name || "Salon";
  const description = salon?.venue?.address?.formatted || "";

  return (
    <SalonSliderProvider>
      <PageShell 
        variant="dashboard" 
        customHeader={true}
        customHeaderContent={<SalonHeader salon={salon} />}
        contentClassName="mt-6"
      >
        <SalonClient slug={slug} initialSalon={salon} />
      </PageShell>
    </SalonSliderProvider>
  );
}
