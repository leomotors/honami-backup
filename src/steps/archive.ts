import fs from "node:fs/promises";

import { targets } from "../const.js";
import { environment } from "../environment.js";
import { exec } from "../lib/exec.js";
import { tarballFolder } from "../tarball.js";

export async function archiveBalls() {
  await exec("rm -rf out && mkdir -p out");

  const result = {} as Record<
    string,
    { fileSize: string; timeArchive: string }
  >;

  for (const target of targets) {
    console.log(`Archiving ${target}...`);
    const time = await tarballFolder(environment.BACKUP_PATH + "/" + target);

    const fileInfo = await fs.stat(`out/${target}.tar.gz`);
    const fileSizeMB = (fileInfo.size / 2 ** 20).toFixed(4);

    const timeTaken = (time / 1000).toFixed(3);
    result[target] = { fileSize: fileSizeMB, timeArchive: timeTaken };

    console.log(
      `Successfully archived ${target} (${fileSizeMB} MB) in ${timeTaken} seconds`,
    );
  }

  return result;
}
