"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoginRequiredModal from "@/components/Auth/LoginRequiredModal";
import { destinations } from "@/lib/travixa-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type StoredUser = {
  id: string;
  name?: string;
  email?: string;
};

type TripRequest = {
  _id: string;
  destination?: {
    name?: string;
    state?: string;
  };
  budget: number;
  days: number;
  travelStyle?: string;
  season?: string;
  travelPartner?: string;
  createdAt?: string;
};

export default function UserDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [message, setMessage] = useState("");
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  const loadTripRequests = async () => {
    const storedUser = localStorage.getItem("travixaUser");
    const user: StoredUser | null = storedUser ? JSON.parse(storedUser) : null;

    if (!user?.id) {
      setTripRequests([]);
      return;
    }

    try {
      setIsLoadingTrips(true);
      setMessage("");
      const response = await fetch(`${apiBaseUrl}/api/trip-requests?userId=${user.id}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your trip requests.");
      }

      setTripRequests(result.data || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load your trip requests.");
    } finally {
      setIsLoadingTrips(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("travixaToken");
    setIsLoggedIn(Boolean(token));
    setShowLogin(!token);

    if (token) {
      loadTripRequests();
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    loadTripRequests();
  };

  const deleteTripRequest = async (requestId: string) => {
    const confirmed = window.confirm("Delete this trip request?");
    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      const token = localStorage.getItem("travixaToken");
      const response = await fetch(`${apiBaseUrl}/api/trip-requests/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete trip request.");
      }

      setTripRequests((currentRequests) =>
        currentRequests.filter((request) => request._id !== requestId)
      );
      setMessage("Trip request deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete trip request.");
    }
  };

  return (
    <main className="bg-[#f7f7f2] px-4 pb-20 pt-32 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <LoginRequiredModal
        isOpen={showLogin}
        title="Login to view My Trips"
        message="Your saved trips, booking requests, and profile are private to your Travixa account."
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      <section className="mx-auto max-w-screen-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
          My Trips
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Your Travixa workspace</h1>

        {!isLoggedIn ? (
          <div className="mt-10 rounded-[2rem] border border-zinc-950/10 bg-white p-8 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-semibold">Login required</h2>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-300">
              Please sign in to view saved destinations, trip requests, booking history, and your
              Travixa profile.
            </p>
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="mt-6 rounded-full bg-zinc-950 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-zinc-950"
            >
              Login to continue
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2rem] border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap gap-2">
                {["My Trips", "Saved Destinations", "Profile"].map((tab, index) => (
                  <span
                    key={tab}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      index === 0
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                        : "bg-zinc-100 dark:bg-white/10"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              {message && (
                <p className="mt-6 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
                  {message}
                </p>
              )}

              <div className="mt-8 grid gap-4">
                {isLoadingTrips && (
                  <p className="rounded-3xl border border-zinc-950/10 p-5 text-zinc-600 dark:border-white/10 dark:text-zinc-300">
                    Loading your trip requests...
                  </p>
                )}

                {!isLoadingTrips && tripRequests.length === 0 && (
                  <p className="rounded-3xl border border-zinc-950/10 p-5 text-zinc-600 dark:border-white/10 dark:text-zinc-300">
                    No trip requests yet. Generate a trip preview from Studio to start.
                  </p>
                )}

                {tripRequests.map((request) => (
                  <article
                    key={request._id}
                    className="rounded-3xl border border-zinc-950/10 p-5 dark:border-white/10"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {request.destination?.name || "Travixa trip request"}
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                          {request.days} days · {request.travelStyle || "Travel style"} ·{" "}
                          {request.season || "Season"} · Rs.{" "}
                          {Number(request.budget || 0).toLocaleString("en-IN")}
                        </p>
                        {request.createdAt && (
                          <p className="mt-2 text-xs text-zinc-500">
                            Created {new Date(request.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTripRequest(request._id)}
                        className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <aside className="rounded-[2rem] border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-xl font-semibold">Saved Destinations</h2>
              <div className="mt-5 space-y-3">
                {destinations.slice(0, 4).map((destination) => (
                  <Link
                    key={destination.slug}
                    href={`/destinations/${destination.slug}`}
                    className="block rounded-2xl bg-zinc-100 p-4 font-semibold dark:bg-white/10"
                  >
                    {destination.name}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
