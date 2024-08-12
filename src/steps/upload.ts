import fs from "node:fs/promises";

import { sendMessage } from "../discord.js";
import { environment } from "../environment.js";
import { exec } from "../lib/exec.js";
import { tarExtension } from "../tarball.js";

export async function uploadBalls(archiveRes: Record<string, unknown>) {
  const result = {} as Record<string, { timeUpload: string }>;

  for (const targetName of Object.keys(archiveRes)) {
    const start = performance.now();
    const fileName = `${targetName}.${tarExtension}`;
    const targetFile = `./out/${fileName}`;
    const fileInfo = await fs.stat(targetFile);

    console.log(
      `Uploading ${targetName} (File Size: ${(fileInfo.size / 2 ** 20).toFixed(
        4,
      )} MB)...`,
    );

    const { stderr, stdout } = await exec(
      `rclone sync ${targetFile} ${environment.RCLONE_FOLDER}`,
    );

    if (stdout || stderr) {
      await sendMessage(
        `Error when uploading ${fileName}: stdout=${stdout} stderr=${stderr}`,
      );
    }

    const duration = ((performance.now() - start) / 1000).toFixed(3);

    result[targetName] = { timeUpload: duration };

    console.log(`Uploaded ${targetName} successfully in ${duration} seconds`);
  }

  return result;
}
