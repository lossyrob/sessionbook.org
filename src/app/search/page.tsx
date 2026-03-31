import { Suspense } from "react";

import { TuneSearch } from "@/components/tune-search";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const { repository } = await loadContentRepository();
  const tunes = repository.listPublicTunes();

  const searchTunes = tunes.map((tune) => ({
    id: tune.id,
    slug: tune.slug,
    name: tune.name,
    aliases: tune.aliases,
    tuneType: tune.tuneType,
    setMemberships: tune.setMemberships,
    chart: tune.chart,
  }));

  return (
    <Suspense fallback={null}>
      <TuneSearch tunes={searchTunes} />
    </Suspense>
  );
}
