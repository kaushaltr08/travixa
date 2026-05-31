import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import TripBookingSlider from "@/components/Booking/TripBookingSlider";
import { destinations, travelStyles } from "@/lib/travixa-data";

export const metadata: Metadata = {
  title: "Travixa | Travel Based On Your Vibe",
  description: "Discover and plan India trips by mood, style, budget, season, and duration.",
};

const features = [
  "Mood-led discovery",
  "Season and budget intelligence",
  "Day-wise itinerary previews",
  "Saved destinations and trip requests",
];

const testimonials = [
  ["Aarav Mehta", "Travixa turned a vague beach mood into a Goa plan we could actually use."],
  ["Nisha Rao", "The recommendations felt local, polished, and much sharper than a package list."],
  ["Kabir Singh", "I planned a three-day Rajasthan escape in one sitting. The flow is lovely."],
];

export default function Home() {
  return (
    <main className="bg-[#f7f7f2] text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#67e8f933,transparent_32%),radial-gradient(circle_at_80%_20%,#fb718533,transparent_30%)]" />
        <div className="container relative mx-auto max-w-screen-xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                India travel intelligence
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
                Travel Based On Your Vibe
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
                Travixa helps you discover Indian destinations by mood, budget, duration, season,
                partner, and travel style. No booking clutter. Just sharper trip decisions.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/studio" className="rounded-full bg-zinc-950 px-7 py-4 text-center font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-zinc-950">
                  Open Studio
                </Link>
                <Link href="#book-trip" className="rounded-full bg-teal-500 px-7 py-4 text-center font-semibold text-zinc-950 transition hover:bg-teal-400">
                  Book Trip
                </Link>
                <Link href="/explore" className="rounded-full border border-zinc-950/15 bg-white/50 px-7 py-4 text-center font-semibold backdrop-blur transition hover:border-teal-500 dark:border-white/15 dark:bg-white/10">
                  Explore Styles
                </Link>
              </div>
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/40 bg-zinc-950 shadow-2xl dark:border-white/10">
              <Image
                src={destinations[0].coverImage}
                alt="Goa coastline travel preview"
                fill
                sizes="(min-width: 1024px) 48vw, 100vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/25 to-zinc-950/10" />
              <div className="relative flex min-h-[420px] flex-col justify-between p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                    Vibe preview
                  </div>
                  <button
                    type="button"
                    className="grid h-12 w-12 place-items-center rounded-full bg-white text-zinc-950 shadow-lg"
                    aria-label="Travel preview"
                  >
                    <span className="ml-1 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-zinc-950" />
                  </button>
                </div>
                <div className="max-w-md text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">
                    Goa, coastal escape
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                    Beaches, food trails, hidden islands.
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-white/80 sm:text-base">
                    See how Travixa turns a mood into a real trip: best season, budget range,
                    day-wise ideas, and local experiences.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["3-5 days", "Rs. 12k+", "Couple friendly"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="book-trip">
        <TripBookingSlider destinations={destinations} />
      </div>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-screen-xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Mood selector</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Pick the energy of the trip</h2>
            </div>
            <Link href="/studio" className="font-semibold text-teal-700 dark:text-teal-300">Generate a preview</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {travelStyles.slice(0, 8).map((style) => (
              <Link href="/explore" key={style.name} className="group rounded-3xl border border-zinc-950/10 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${style.accent} font-bold text-white`}>
                  {style.icon}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{style.name}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{style.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="px-4 py-16">
        <div className="container mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">Popular destinations</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {destinations.slice(0, 9).map((destination) => (
              <article key={destination.slug} className="overflow-hidden rounded-3xl border border-zinc-950/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                <Image src={destination.coverImage} alt={destination.name} width={520} height={340} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <p className="text-sm text-zinc-500">{destination.state}</p>
                  <h3 className="mt-1 text-2xl font-semibold">{destination.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{destination.description}</p>
                  <p className="mt-4 font-semibold text-teal-700 dark:text-teal-300">{destination.budgetRange}</p>
                  <div className="mt-5 flex gap-3">
                    <Link href={`/destinations/${destination.slug}`} className="rounded-full border border-zinc-950/10 px-4 py-2 text-sm font-semibold dark:border-white/10">
                      View place
                    </Link>
                    <Link href="#book-trip" className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                      Book trip
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto grid max-w-screen-xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Features</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Planning clarity without booking noise</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="rounded-3xl border border-zinc-950/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
                <p className="text-xl font-semibold">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-screen-xl">
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map(([name, text]) => (
              <figure key={name} className="rounded-3xl border border-zinc-950/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
                <blockquote className="leading-7 text-zinc-700 dark:text-zinc-300">"{text}"</blockquote>
                <figcaption className="mt-5 font-semibold">{name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-14 rounded-[2rem] bg-zinc-950 p-8 text-white sm:p-10 dark:bg-white dark:text-zinc-950">
            <h2 className="text-3xl font-semibold">Ready to plan around your vibe?</h2>
            <Link href="/studio" className="mt-6 inline-flex rounded-full bg-teal-400 px-6 py-3 font-semibold text-zinc-950">Start in Travixa Studio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
