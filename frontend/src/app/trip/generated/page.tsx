"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { destinations, generatedItinerary } from "@/lib/travixa-data";

function GeneratedTripContent() {
  const searchParams = useSearchParams();
  const destinationName = searchParams.get("destination");
  const destination = destinations.find((item) => item.name === destinationName) || destinations[0];
  const budget = Number(searchParams.get("budget") || 28000);
  const days = Number(searchParams.get("days") || 3);
  const style = searchParams.get("style") || "Adventure";
  const season = searchParams.get("season") || "Winter";
  const partner = searchParams.get("partner") || "Couple";

  return (
    <main className="bg-[#f7f7f2] px-4 pb-20 pt-32 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="mx-auto max-w-screen-xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Generated trip preview
            </p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">
              {days}-day {style.toLowerCase()} plan for {destination.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              Built for {partner.toLowerCase()} travel in {season.toLowerCase()}, with a practical
              estimated budget and a timeline you can refine.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Destination", destination.name],
                ["Estimated Budget", `Rs. ${budget.toLocaleString("en-IN")}`],
                ["Duration", `${days} days`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-zinc-950/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm text-zinc-500">{label}</p>
                  <p className="mt-2 text-xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-zinc-950/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-semibold">Trip Summary</h2>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{destination.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {destination.highlights.map((item) => (
                <span key={item} className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {generatedItinerary.map((item, index) => (
              <article key={item.day} className="relative rounded-3xl border border-zinc-950/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/5">
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{item.day}</p>
                    <h2 className="mt-1 text-2xl font-semibold">{item.title}</h2>
                    <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{item.plan}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-[2rem] border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-xl font-semibold">Recommendations</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="font-semibold">Hidden gems</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{destination.hiddenGems.join(", ")}</p>
              </div>
              <div>
                <p className="font-semibold">Food</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{destination.foodRecommendations.join(", ")}</p>
              </div>
              <Link href={`/destinations/${destination.slug}`} className="inline-flex rounded-full bg-teal-500 px-5 py-3 font-semibold text-zinc-950">
                View destination detail
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function GeneratedTripPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-[#f7f7f2] px-4 pb-20 pt-32 text-zinc-950 dark:bg-zinc-950 dark:text-white">
          <section className="mx-auto max-w-screen-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Loading generated trip
            </p>
          </section>
        </main>
      }
    >
      <GeneratedTripContent />
    </Suspense>
  );
}
