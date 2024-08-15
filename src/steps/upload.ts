import fs from "node:fs/promises";

import { sendMessage } from "../discord.js";
import { environment } from "../environment.js";
import { exec } from "../lib/exec.js";
import { tarExtension } from "../tarball.js";

async function uploadTarget(
  targetName: string,
  resultFn: (durationMs: number) => void,
) {
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

  const durationMs = performance.now() - start;
  const duration = (durationMs / 1000).toFixed(3);

  resultFn(durationMs);

  console.log(`Uploaded ${targetName} successfully in ${duration} seconds`);
}

const parallelUploads = 10;

export async function uploadBalls(archiveRes: Record<string, unknown>) {
  const result = {} as Record<string, { timeUpload: number }>;

  const targetNames = Object.keys(archiveRes);

  for (let i = 0; i < targetNames.length; i += parallelUploads) {
    await Promise.all(
      targetNames
        .slice(i, i + parallelUploads)
        .map((targetName) =>
          uploadTarget(
            targetName,
            (duration) => (result[targetName] = { timeUpload: duration }),
          ),
        ),
    );
  }

  return result;
}
