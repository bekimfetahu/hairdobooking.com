import PageShell from "@/components/layouts/PageShell";
import SalonClient from "@/components/salon/SalonClient";
import SalonHeader from "@/components/salon/SalonHeader";
import { sendRequest } from "@/services/sendRequest";
import { notFound } from "next/navigation";

export default async function SalonServicePage({ params }) {
  const { slug, serviceUuid } = await params;

  if (!slug || !serviceUuid) {
    notFound();
  }

  let salon = null;
  try {
    salon = await sendRequest({
      method: "get",
      access_type: "laravelApp",
      api: `client/salons/${slug}`,
      data: {},
    });
  } catch (err) {
    salon = null;
  }

  return (
    <PageShell
      variant="dashboard"
      customHeader={true}
      customHeaderContent={<SalonHeader salon={salon} />}
      contentClassName="mt-6"
    >
      <SalonClient slug={slug} initialSalon={salon} initialServiceUuid={serviceUuid} />
    </PageShell>
  );
}