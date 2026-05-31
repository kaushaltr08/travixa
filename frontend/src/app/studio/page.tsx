"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import LoginRequiredModal from "@/components/Auth/LoginRequiredModal";
import { destinations, travelStyles } from "@/lib/travixa-data";

type StudioForm = {
  destination: string;
  budget: number;
  days: number;
  travelStyle: string;
  season: string;
  travelPartner: string;
};

function StudioFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const styleFromQuery = searchParams.get("style") || travelStyles[0].name;
  const defaultDestination = destinations[0].name;
  const seasons = ["Winter", "Summer", "Monsoon", "Post-monsoon"];
const partners = ["Solo", "Couple", "Friends", "Family"];
const [showLogin, setShowLogin] = useState(false);
const [pendingValues, setPendingValues] = useState<StudioForm | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch } = useForm<StudioForm>({
    defaultValues: {
      destination: defaultDestination,
      budget: 28000,
      days: 3,
      travelStyle: styleFromQuery,
      season: "Winter",
      travelPartner: "Couple",
    },
  });

  const selectedDestination = watch("destination");
  const destination = useMemo(
    () => destinations.find((item) => item.name === selectedDestination) || destinations[0],
    [selectedDestination]
  );

  const saveTripRequest = async (values: StudioForm) => {
    const storedUser = localStorage.getItem("travixaUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user?.id) {
      throw new Error("Please login before creating a trip request.");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/trip-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("travixaToken") || ""}`,
      },
      body: JSON.stringify({
        userId: user.id,
        destination: values.destination,
        budget: Number(values.budget),
        days: Number(values.days),
        travelStyle: values.travelStyle,
        season: values.season,
        travelPartner: values.travelPartner,
      }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to save trip request.");
    }
  };

  const generateTrip = (values: StudioForm) => {
    const params = new URLSearchParams({
      destination: values.destination,
      budget: String(values.budget),
      days: String(values.days),
      style: values.travelStyle,
      season: values.season,
      partner: values.travelPartner,
    });
    router.push(`/trip/generated?${params.toString()}`);
  };

  const createAndGenerateTrip = async (values: StudioForm) => {
    try {
      setIsSaving(true);
      setMessage("");
      await saveTripRequest(values);
      generateTrip(values);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save trip request.");
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = (values: StudioForm) => {
    const token = localStorage.getItem("travixaToken");

    if (!token) {
      setPendingValues(values);
      setShowLogin(true);
      return;
    }

    createAndGenerateTrip(values);
  };

  const continueAfterLogin = () => {
    setShowLogin(false);
    if (pendingValues) {
      createAndGenerateTrip(pendingValues);
      setPendingValues(null);
    }
  };

  return (
    <main className="bg-[#f7f7f2] px-4 pb-20 pt-32 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <LoginRequiredModal
        isOpen={showLogin}
        title="Login to generate your trip"
        message="Travixa saves generated trip previews to your account, so please sign in first."
        onClose={() => setShowLogin(false)}
        onSuccess={continueAfterLogin}
      />
      <section className="mx-auto grid max-w-screen-xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Travel Intelligence Studio
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Shape the trip before you search</h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Enter the six signals Travixa cares about most: destination, budget, days, style,
            season, and who you are travelling with.
          </p>
          <div className="mt-8 rounded-3xl border border-zinc-950/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-zinc-500">Live preview</p>
            <h2 className="mt-2 text-2xl font-semibold">{destination.name}</h2>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{destination.description}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-zinc-950/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Destination</span>
              <select className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" {...register("destination")}>
                {destinations.map((item) => <option key={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Budget</span>
              <input type="number" min={1000} className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" {...register("budget", { valueAsNumber: true })} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Number of Days</span>
              <input type="number" min={1} max={30} className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" {...register("days", { valueAsNumber: true })} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Travel Style</span>
              <select className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" {...register("travelStyle")}>
                {travelStyles.map((style) => <option key={style.name}>{style.name}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Season</span>
              <select className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" {...register("season")}>
                {seasons.map((season) => <option key={season}>{season}</option>)}
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Travel Partner</span>
              <select className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" {...register("travelPartner")}>
                {partners.map((partner) => <option key={partner}>{partner}</option>)}
              </select>
            </label>
          </div>
          {message && (
            <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">
              {message}
            </p>
          )}
          <button
            disabled={isSaving}
            className="mt-7 h-12 w-full rounded-full bg-zinc-950 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
          >
            {isSaving ? "Saving request..." : "Generate Trip Preview"}
          </button>
          <Link href="/explore" className="mt-5 block text-center text-sm font-semibold text-teal-700 dark:text-teal-300">
            Browse travel styles
          </Link>
        </form>
      </section>
    </main>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-[#f7f7f2] px-4 pb-20 pt-32 text-zinc-950 dark:bg-zinc-950 dark:text-white">
          <section className="mx-auto max-w-screen-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Loading studio
            </p>
          </section>
        </main>
      }
    >
      <StudioFormPage />
    </Suspense>
  );
}
