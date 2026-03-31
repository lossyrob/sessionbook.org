import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  renderSessionContentDocument,
  renderSetContentDocument,
  renderTuneContentDocument,
} from "@/lib/session-work/workflow";
import { buildPublishableCorpus } from "@/lib/content/publishable-corpus";

async function removeMarkdownFiles(directoryPath: string): Promise<void> {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => rm(path.join(directoryPath, entry.name))),
  );
}

async function main() {
  const contentRoot = path.join(process.cwd(), "content");
  const tunesRoot = path.join(contentRoot, "tunes");
  const setsRoot = path.join(contentRoot, "sets");
  const sessionsRoot = path.join(contentRoot, "sessions");

  await Promise.all([
    mkdir(tunesRoot, { recursive: true }),
    mkdir(setsRoot, { recursive: true }),
    mkdir(sessionsRoot, { recursive: true }),
  ]);

  await Promise.all([
    removeMarkdownFiles(tunesRoot),
    removeMarkdownFiles(setsRoot),
    removeMarkdownFiles(sessionsRoot),
  ]);

  const corpus = await buildPublishableCorpus();

  await Promise.all([
    ...corpus.tunes.map((tune) =>
      writeFile(
        path.join(tunesRoot, `${tune.slug}.md`),
        renderTuneContentDocument(tune),
        "utf8",
      ),
    ),
    ...corpus.sets.map((setDocument) =>
      writeFile(
        path.join(setsRoot, `${setDocument.slug}.md`),
        renderSetContentDocument(setDocument),
        "utf8",
      ),
    ),
    ...corpus.sessions.map((session) =>
      writeFile(
        path.join(sessionsRoot, `${session.slug}.md`),
        renderSessionContentDocument(session),
        "utf8",
      ),
    ),
  ]);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
