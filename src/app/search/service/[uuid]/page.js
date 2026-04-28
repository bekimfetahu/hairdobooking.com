import PageShell from "@/components/layouts/PageShell";
import ServiceSearchClient from "@/components/search/ServiceSearchClient";
import { sendRequest } from "@/services/sendRequest";
import { notFound } from "next/navigation";

export default async function ServiceSearchPage({ params, searchParams }) {
  const { uuid } = await params;
  const query = (await searchParams) || {};

  if (!uuid) {
    notFound();
  }

  let service = null;

  try {
    service = await sendRequest({
      method: "get",
      access_type: "laravelApp",
      api: `client/search/services/${uuid}`,
      data: {},
    });
  } catch (err) {
    notFound();
  }

  return (
    <PageShell
      variant="marketing"
      title="Services search"
      contentClassName="mt-6"
    >
      <ServiceSearchClient
        initialService={service}
        initialServiceUuid={uuid}
        initialServiceName={query.name || service?.name || ""}
        initialLocationLabel={query.loc || ""}
        initialLocationLat={query.lat ? Number(query.lat) : null}
        initialLocationLon={query.lon ? Number(query.lon) : null}
        initialDistance={query.distance || "10km"}
      />
    </PageShell>
  );
}
