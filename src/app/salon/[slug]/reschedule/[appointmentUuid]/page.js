import PageShell from "@/components/layouts/PageShell";
import SalonHeader from "@/components/salon/SalonHeader";
import RescheduleAppointmentClient from "@/components/appointments/RescheduleAppointmentClient";
import { sendRequest } from "@/services/sendRequest";
import { notFound } from "next/navigation";

export default async function RescheduleAppointmentPage({ params }) {
  const { slug, appointmentUuid } = await params;
  let salon = null;

  try {
    salon = await sendRequest({
      method: "get",
      access_type: "laravelApp",
      api: `client/salons/${slug}`,
      data: {},
    });
  } catch {
    notFound();
  }

  return (
    <PageShell
      variant="dashboard"
      customHeader
      customHeaderContent={<SalonHeader salon={salon} />}
      contentClassName="mt-6"
    >
      <RescheduleAppointmentClient
        slug={slug}
        appointmentUuid={appointmentUuid}
        initialSalon={salon}
      />
    </PageShell>
  );
}
