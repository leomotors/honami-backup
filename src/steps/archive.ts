import fs from "node:fs/promises";

import { sendMessage } from "../discord.js";
import { exec } from "../lib/exec.js";
import { tarExtension, tarballFolder } from "../tarball.js";
import { Target } from "../targets.js";

export async function archiveBalls(targets: Target[]) {
  await exec("rm -rf out && mkdir -p out");

  const result = {} as Record<
    string,
    { fileSize: string; timeArchive: string }
  >;

  for (const target of targets) {
    console.log(`Archiving ${target.name}...`);

    try {
      const time = await tarballFolder(target);
      const fileInfo = await fs.stat(`out/${target.name}.${tarExtension}`);
      const fileSizeMiB = (fileInfo.size / 2 ** 20).toFixed(4);

      const timeTaken = (time / 1000).toFixed(3);
      result[target.name] = { fileSize: fileSizeMiB, timeArchive: timeTaken };

      console.log(
        `Successfully archived ${target.name} (${fileSizeMiB} MB) in ${timeTaken} seconds`,
      );
    } catch (err) {
      await sendMessage(`Failed to archive ${target.name}: ${err}`);
    }
  }

  return result;
}
