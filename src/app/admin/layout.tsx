import type { Metadata } from "next";
import { ThemeProvider } from "@/features/core/components/ThemeProvider";
import { AdminLayout as LayoutComponent } from "@/features/admin/components/AdminLayout";

export const metadata: Metadata = {
  title: "Quick Assist Admin",
  description: "Agent Dashboard for Support Chat",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LayoutComponent>{children}</LayoutComponent>
    </ThemeProvider>
  );
}
