import { notFound } from "next/navigation";
import { DevicePage } from "@/components/lab/xdr/device-page";
import { buildDevices, getDevice } from "@/lab/device";

export function generateStaticParams() {
  return buildDevices().map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = getDevice(id);
  return {
    title: device ? device.name : "Device",
    description: "Device entity page with response actions, timeline and vulnerability findings.",
  };
}

export default async function DeviceEntityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = getDevice(id);
  if (!device) notFound();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Assets
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Device entity</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The response actions are the exercise. They read as interchangeable verbs in the menu and
          are not — full and selective isolation differ in what the user keeps, restricting app
          execution leaves the device online, and only three of the eight can be undone.
        </p>
      </div>
      <DevicePage device={device} />
    </div>
  );
}
