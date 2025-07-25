import fs from "node:fs/promises";

import { Target } from "../config.js";
import { sendMessage } from "../discord.js";
import { exec } from "../lib/exec.js";
import { withRetries } from "../lib/retries.js";
import { tarballFolder } from "../lib/tarball.js";
import { getFolderSize } from "./folder.js";

const retries = 3;

export type ArchiveResult = Record<
  string,
  {
    // In MiB
    fileSize: number;
    // In Seconds
    timeArchive: number;
    // Output File
    outputTarPath: string;
    // Target Object
    target: Target;
  }
>;

export async function archiveBalls(targets: Target[]): Promise<ArchiveResult> {
  await exec("rm -rf out && mkdir -p out");

  const result = {} as ArchiveResult;

  for (const target of targets) {
    console.log(`Archiving ${target.name}...`);

    await withRetries(
      async () => {
        const { targetTarName, timeMs } = await tarballFolder(target);
        const fileInfo = await fs.stat(targetTarName);
        const fileSizeMiB =
          target.uploadType === "folder"
            ? (await getFolderSize(targetTarName)) / 2 ** 20
            : fileInfo.size / 2 ** 20;

        result[target.name] = {
          fileSize: fileSizeMiB,
          timeArchive: timeMs / 1000,
          outputTarPath: targetTarName,
          target: target,
        };

        const timeTakenSecStr = (timeMs / 1000).toFixed(3);
        console.log(
          `Successfully archived ${target.name} (${fileSizeMiB} MB) in ${timeTakenSecStr} seconds`,
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
