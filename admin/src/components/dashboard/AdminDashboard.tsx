"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  _id: string;
  name: string;
  email: string;
};

type Destination = {
  _id: string;
  name: string;
};

type Experience = {
  _id: string;
  title: string;
};

type TripRequest = {
  _id: string;
  userId?: {
    name?: string;
    email?: string;
  };
  destination?: {
    name?: string;
    state?: string;
  };
  budget: number;
  days: number;
  travelStyle: string;
  season: string;
  travelPartner: string;
  createdAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const fetchJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });
  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to load dashboard data.");
  }

  return result.data;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setMessage("");
        const [usersData, destinationsData, experiencesData, tripRequestsData] = await Promise.all([
          fetchJson<User[]>("/api/users"),
          fetchJson<Destination[]>("/api/destinations"),
          fetchJson<Experience[]>("/api/experiences"),
          fetchJson<TripRequest[]>("/api/trip-requests"),
        ]);

        setUsers(usersData);
        setDestinations(destinationsData);
        setExperiences(experiencesData);
        setTripRequests(tripRequestsData);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const chartData = useMemo(
    () => [
      { label: "Users", total: users.length },
      { label: "Destinations", total: destinations.length },
      { label: "Experiences", total: experiences.length },
      { label: "Requests", total: tripRequests.length },
    ],
    [users.length, destinations.length, experiences.length, tripRequests.length]
  );

  const popularStyles = useMemo(() => {
    const counts = tripRequests.reduce<Record<string, number>>((acc, request) => {
      const key = request.travelStyle || "Unspecified";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([label, total]) => ({ label, total }));
  }, [tripRequests]);

  const viewedDestinations = useMemo(() => {
    const counts = tripRequests.reduce<Record<string, number>>((acc, request) => {
      const key = request.destination?.name || "Unspecified";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([label, total]) => ({ label, total }));
  }, [tripRequests]);

  const widgets = [
    { label: "Total Users", value: users.length },
    { label: "Total Destinations", value: destinations.length },
    { label: "Total Experiences", value: experiences.length },
    { label: "Total Trip Requests", value: tripRequests.length },
  ];

  const recentRequests = tripRequests.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Travixa Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor users, destinations, and AI trip planner requests.
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-500">
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {widgets.map((widget) => (
          <div
            key={widget.label}
            className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{widget.label}</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
              {isLoading ? "--" : widget.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[
          ["Popular Travel Styles", popularStyles],
          ["Most Viewed Destinations", viewedDestinations],
        ].map(([title, data]) => (
          <div key={title as string} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title as string}</h2>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data as { label: string; total: number }[]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#12B76A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Snapshot</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#465FFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Requests</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {recentRequests.length} latest
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="px-3 py-3 font-medium">Traveler</th>
                  <th className="px-3 py-3 font-medium">Destination</th>
                  <th className="px-3 py-3 font-medium">Budget</th>
                  <th className="px-3 py-3 font-medium">Days</th>
                  <th className="px-3 py-3 font-medium">Style</th>
                  <th className="px-3 py-3 font-medium">Season</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-b border-gray-100 text-gray-700 last:border-0 dark:border-gray-800 dark:text-gray-300"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.userId?.name || "Guest"}
                      </p>
                      <p className="text-xs text-gray-500">{request.userId?.email || "-"}</p>
                    </td>
                    <td className="px-3 py-4">{request.destination?.name || "-"}</td>
                    <td className="px-3 py-4">Rs. {request.budget.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-4">{request.days}</td>
                    <td className="px-3 py-4">{request.travelStyle || "-"}</td>
                    <td className="px-3 py-4">{request.season || "-"}</td>
                    <td className="px-3 py-4">
                      {new Date(request.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
                {!isLoading && recentRequests.length === 0 && (
                  <tr>
                    <td className="px-3 py-8 text-center text-gray-500" colSpan={7}>
                      No trip requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
