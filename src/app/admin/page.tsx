import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Painel administrativo | Achei Turismo",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminPage() { return <AdminDashboard />; }
