import Link from "next/link";
import { travelStyles } from "@/lib/travixa-data";

export default function ExplorePage() {
  return (
    <main className="bg-[#f7f7f2] px-4 pb-20 pt-32 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="mx-auto max-w-screen-xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Explore
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Travel styles for every kind of India trip</h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Start with a style, then let Travixa tune the plan by season, budget, days, and partner.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {travelStyles.map((style) => (
            <article key={style.name} className="rounded-3xl border border-zinc-950/10 bg-white/75 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${style.accent} text-lg font-bold text-white`}>
                {style.icon}
              </span>
              <h2 className="mt-6 text-2xl font-semibold">{style.name}</h2>
              <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{style.description}</p>
              <Link href={`/studio?style=${encodeURIComponent(style.name)}`} className="mt-6 inline-flex font-semibold text-teal-700 dark:text-teal-300">
                Plan this style
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
