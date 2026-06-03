"use client";

import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BookingStatus = "pending" | "contacted" | "confirmed" | "cancelled";

type Booking = {
  _id: string;
  module: string;
  customerName?: string;
  email?: string;
  phone?: string;
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  travellers?: number;
  classType?: string;
  status: BookingStatus;
  notes?: string;
  createdAt?: string;
};

const statusOptions: BookingStatus[] = [
  "pending",
  "contacted",
  "confirmed",
  "cancelled",
];

const statusColor: Record<BookingStatus, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  contacted: "info",
  confirmed: "success",
  cancelled: "error",
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const titleCase = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export default function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${apiBaseUrl}/api/bookings`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load bookings.");
      }

      setBookings(result.data || []);
    } catch (loadError) {
      setError(
        loadError instanceof TypeError
          ? `Cannot connect to backend at ${apiBaseUrl}. Start the server, then refresh.`
          : loadError instanceof Error
          ? loadError.message
          : "Unable to load bookings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const totalBookings = bookings.length;
  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending").length,
    [bookings]
  );

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      setUpdatingId(bookingId);
      setError("");

      const response = await fetch(`${apiBaseUrl}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update booking status.");
      }

      setBookings((current) =>
        current.map((booking) => (booking._id === bookingId ? result.data : booking))
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const createDemoBooking = async () => {
    try {
      setIsCreatingDemo(true);
      setError("");

      const response = await fetch(`${apiBaseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module: "flights",
          customerName: "Demo Traveller",
          email: "demo.traveller@example.com",
          phone: "9876543210",
          from: "Delhi",
          to: "Bengaluru",
          departureDate: new Date().toISOString(),
          travellers: 1,
          classType: "Economy/Premium Economy",
          notes: "Created from admin test booking button",
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create test booking.");
      }

      setBookings((current) => [result.data, ...current]);
    } catch (createError) {
      setError(
        createError instanceof TypeError
          ? `Cannot connect to backend at ${apiBaseUrl}. Start the server, then try again.`
          : createError instanceof Error
          ? createError.message
          : "Unable to create test booking."
      );
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    const confirmed = window.confirm("Delete this booking request?");
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(bookingId);
      setError("");

      const response = await fetch(`${apiBaseUrl}/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete booking.");
      }

      setBookings((current) => current.filter((booking) => booking._id !== bookingId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="text-theme-sm text-gray-500 dark:text-gray-400">Total bookings</span>
          <h2 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {totalBookings}
          </h2>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="text-theme-sm text-gray-500 dark:text-gray-400">Pending follow-ups</span>
          <h2 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {pendingBookings}
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Booking Requests
            </h1>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              Review new travel leads and move them through follow-up.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createDemoBooking}
              disabled={isCreatingDemo}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingDemo ? "Creating..." : "Create Test Booking"}
            </button>
            <button
              type="button"
              onClick={loadBookings}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="border-b border-error-100 bg-error-50 px-5 py-3 text-theme-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-500">
            {error}
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1240px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Customer
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Module
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Route
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Travel Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Travellers
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading && bookings.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-8 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-8 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                      No booking requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                            {booking.customerName || "Guest"}
                          </span>
                          <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                            {booking.email || "-"}
                          </span>
                          <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                            {booking.phone || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {titleCase(booking.module)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {(booking.from || "-") + " -> " + (booking.to || "-")}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {formatDate(booking.departureDate)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        <span className="block">{booking.travellers || 1}</span>
                        <span className="block text-theme-xs">{booking.classType || "-"}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Badge size="sm" color={statusColor[booking.status]}>
                            {titleCase(booking.status)}
                          </Badge>
                          <select
                            value={booking.status}
                            disabled={updatingId === booking._id}
                            onChange={(event) =>
                              updateStatus(booking._id, event.target.value as BookingStatus)
                            }
                            className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-theme-sm text-gray-700 outline-none transition focus:border-brand-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-400"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {titleCase(status)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {formatDate(booking.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => deleteBooking(booking._id)}
                          disabled={deletingId === booking._id}
                          className="rounded-lg bg-error-50 px-3 py-2 text-theme-xs font-semibold text-error-600 transition hover:bg-error-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-error-500/10 dark:text-error-400"
                        >
                          {deletingId === booking._id ? "Deleting..." : "Delete"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
