import { cache } from "react";

import { loadSessionbookCorpus } from "@/lib/content/load-corpus";
import { createContentRepository } from "@/lib/content/repository";

export const loadContentRepository = cache(async () => {
  const corpus = await loadSessionbookCorpus();

  return {
    repository: createContentRepository(corpus),
  };
});
