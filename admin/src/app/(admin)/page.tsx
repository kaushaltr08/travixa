import type { Metadata } from "next";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Travixa Admin",
  description: "Travixa admin panel",
};

export default function DashboardPage() {
  return <AdminDashboard />;
}
