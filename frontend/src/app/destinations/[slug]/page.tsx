import Image from "next/image";
import { notFound } from "next/navigation";
import { destinations } from "@/lib/travixa-data";

type DestinationPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export default function DestinationDetailPage({ params }: DestinationPageProps) {
  const destination = destinations.find((item) => item.slug === params.slug);

  if (!destination) {
    notFound();
  }

  const sections = [
    ["Best Time To Visit", [destination.bestTimeToVisit]],
    ["Budget Range", [destination.budgetRange]],
    ["Hidden Gems", destination.hiddenGems],
    ["Attractions", destination.attractions],
    ["Local Experiences", destination.localExperiences],
    ["Food Recommendations", destination.foodRecommendations],
  ];

  return (
    <main className="bg-[#f7f7f2] pb-20 pt-24 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="px-4">
        <div className="mx-auto max-w-screen-xl overflow-hidden rounded-[2rem] border border-zinc-950/10 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="relative min-h-[420px]">
            <Image src={destination.coverImage} alt={destination.name} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">{destination.state}</p>
              <h1 className="mt-3 text-5xl font-semibold sm:text-7xl">{destination.name}</h1>
            </div>
          </div>
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Overview</p>
              <p className="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-300">{destination.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sections.map(([title, items]) => (
                <article key={title as string} className="rounded-3xl border border-zinc-950/10 bg-[#f7f7f2] p-5 dark:border-white/10 dark:bg-zinc-950/60">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {(items as string[]).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
