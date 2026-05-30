import type { Metadata } from "next";
import BookingsTable from "@/components/bookings/BookingsTable";

export const metadata: Metadata = {
  title: "Bookings | Travixa Admin",
  description: "Manage Travixa booking requests",
};

export default function BookingsPage() {
  return <BookingsTable />;
}
