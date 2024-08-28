import fs from "node:fs/promises";

import { sendMessage } from "../discord.js";
import { exec } from "../lib/exec.js";
import { withRetries } from "../lib/retries.js";
import { tarExtension, tarballFolder } from "../tarball.js";
import { Target } from "../targets.js";

const retries = 3;

export async function archiveBalls(targets: Target[]) {
  await exec("rm -rf out && mkdir -p out");

  const result = {} as Record<
    string,
    { fileSize: string; timeArchive: string }
  >;

  for (const target of targets) {
    console.log(`Archiving ${target.name}...`);

    await withRetries(
      async () => {
        const time = await tarballFolder(target);
        const fileInfo = await fs.stat(`out/${target.name}.${tarExtension}`);
        const fileSizeMiB = (fileInfo.size / 2 ** 20).toFixed(4);

        const timeTaken = (time / 1000).toFixed(3);
        result[target.name] = { fileSize: fileSizeMiB, timeArchive: timeTaken };

        console.log(
          `Successfully archived ${target.name} (${fileSizeMiB} MB) in ${timeTaken} seconds`,
        );
      },
      retries,
      async (retry, err) => {
        await sendMessage(
          `Failed to archive ${target.name}: ${err} (Attempt #${retry}/${retries})`,
        );
      },
    );
  }

  return result;
}
