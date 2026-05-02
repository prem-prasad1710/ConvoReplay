import { AppShell } from "@/components/app/AppShell";

export default function AppSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
