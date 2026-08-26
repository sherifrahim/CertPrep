import { LabShell } from "@/components/lab/lab-shell";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LabShell>{children}</LabShell>;
}
