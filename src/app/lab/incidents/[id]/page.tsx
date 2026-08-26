import { notFound } from "next/navigation";
import { IncidentDetail } from "@/components/lab/incident-detail";
import { buildIncidents, getIncident } from "@/lab/incidents";

export function generateStaticParams() {
  return buildIncidents().map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const incident = getIncident((await params).id);
  return incident ? { title: incident.title } : {};
}

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const incident = getIncident((await params).id);
  if (!incident) notFound();
  return <IncidentDetail incident={incident} />;
}
