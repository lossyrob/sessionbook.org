import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import { buildSessionPdfDocument } from "@/lib/session-work/pdf";
import { parseSessionWorkDocument } from "@/lib/session-work/workflow";

type CliOptions = {
  inputPath: string;
  outputPath?: string;
  includeAlternateParts: boolean;
  printLarge: boolean;
  pythonCommand: string;
};

function printUsage(): void {
  console.log(`Usage: npm run render:session-pdf -- <input.md> [output.pdf] [--include-alternates] [--print-large] [--python python3]

Examples:
  npm run render:session-pdf -- Sessions/example_session_work.md
  npm run render:session-pdf -- Sessions/example_session_work.md out/example.pdf --include-alternates
  npm run render:session-pdf -- Sessions/example_session_work.md --print-large`);
}

function parseArgs(argv: string[]): CliOptions {
  const positionals: string[] = [];
  let includeAlternateParts = false;
  let printLarge = false;
  let pythonCommand = process.env.PYTHON ?? "python3";

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (!argument) {
      continue;
    }

    switch (argument) {
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
      case "--include-alternates":
        includeAlternateParts = true;
        continue;
      case "--print-large":
        printLarge = true;
        continue;
      case "--python": {
        const value = argv[index + 1];

        if (!value) {
          throw new Error("Missing value after --python.");
        }

        pythonCommand = value;
        index += 1;
        continue;
      }
      default:
        if (argument.startsWith("--")) {
          throw new Error(`Unknown option: ${argument}`);
        }

        positionals.push(argument);
    }
  }

  if (positionals.length === 0 || positionals.length > 2) {
    printUsage();
    throw new Error("Expected an input session-work path and at most one output PDF path.");
  }

  return {
    inputPath: positionals[0]!,
    outputPath: positionals[1],
    includeAlternateParts,
    printLarge,
    pythonCommand,
  };
}

function getDefaultOutputPath(inputPath: string): string {
  const basename = path.basename(inputPath, ".md");
  const outputBasename = basename.endsWith("_session_work")
    ? basename.slice(0, -"_session_work".length)
    : basename;

  return path.join(process.cwd(), "out", "session-pdfs", `${outputBasename}.pdf`);
}

function toDisplayPath(absolutePath: string): string {
  const relativePath = path.relative(process.cwd(), absolutePath);

  return relativePath && !relativePath.startsWith("..") ? relativePath : absolutePath;
}

async function runRenderer(args: {
  rendererPath: string;
  outputPath: string;
  printLarge: boolean;
  pythonCommand: string;
  payload: ReturnType<typeof buildSessionPdfDocument>;
}): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      args.pythonCommand,
      [
        args.rendererPath,
        "--output",
        args.outputPath,
        ...(args.printLarge ? ["--print-large"] : []),
      ],
      {
        stdio: ["pipe", "inherit", "inherit"],
      },
    );

    child.on("error", reject);
    child.stdin.end(JSON.stringify(args.payload));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`PDF renderer exited with code ${code ?? "unknown"}.`));
    });
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(process.cwd(), options.inputPath);
  const outputPath = path.resolve(
    process.cwd(),
    options.outputPath ?? getDefaultOutputPath(inputPath),
  );
  const rendererPath = path.join(process.cwd(), "scripts", "render-session-pdf.py");
  const source = await readFile(inputPath, "utf8");
  const parsedDocument = parseSessionWorkDocument({
    source,
    sourcePath: inputPath,
  });
  const pdfDocument = buildSessionPdfDocument(parsedDocument, {
    includeAlternateParts: options.includeAlternateParts,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await runRenderer({
    rendererPath,
    outputPath,
    printLarge: options.printLarge,
    pythonCommand: options.pythonCommand,
    payload: pdfDocument,
  });

  console.log(
    `Rendered ${toDisplayPath(outputPath)} from ${toDisplayPath(inputPath)}${
      options.includeAlternateParts ? " (with alternates)" : ""
    }.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
