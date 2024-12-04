import fs from "node:fs/promises";

import { sendMessage } from "../discord.js";
import { environment } from "../environment.js";
import { exec } from "../lib/exec.js";

import { ArchiveResult } from "./archive.js";

function getRCloneCommand(
  targetName: string,
  targetFile: string,
  rcloneFolder: string,
  archiveResult: ArchiveResult[string],
) {
  if (archiveResult.asFolder) {
    return `rclone sync ${targetFile} ${rcloneFolder}/${targetName}`;
  } else {
    return `rclone sync ${targetFile} ${rcloneFolder}`;
  }
}

async function uploadTarget(
  targetName: string,
  targetArchiveResult: ArchiveResult[string],
  resultFn: (durationMs: number) => void,
) {
  const start = performance.now();
  const targetFile = targetArchiveResult.outputTarPath;
  const fileInfo = await fs.stat(targetFile);

  console.log(
    `Uploading ${targetName} (File Size (fs.stat): ${(
      fileInfo.size /
      2 ** 20
    ).toFixed(4)} MB)...`,
  );

  const { stderr, stdout } = await exec(
    getRCloneCommand(
      targetName,
      targetFile,
      environment.RCLONE_FOLDER,
      targetArchiveResult,
    ),
  );

  if (stdout || stderr) {
    await sendMessage(
      `Error when uploading ${targetFile}: stdout=${stdout} stderr=${stderr}`,
    );
  }

  const durationMs = performance.now() - start;
  const duration = (durationMs / 1000).toFixed(3);

  resultFn(durationMs);

  console.log(`Uploaded ${targetName} successfully in ${duration} seconds`);
}

const parallelUploads = 10;

export type UploadResult = Record<string, { timeUpload: number }>;

export async function uploadBalls(
  archiveRes: ArchiveResult,
): Promise<UploadResult> {
  const result = {} as UploadResult;

  const targetNames = Object.keys(archiveRes);

  for (let i = 0; i < targetNames.length; i += parallelUploads) {
    await Promise.all(
      targetNames
        .slice(i, i + parallelUploads)
        .map((targetName) =>
          uploadTarget(
            targetName,
            archiveRes[targetName]!,
            (duration) => (result[targetName] = { timeUpload: duration }),
          ),
        ),
    );
  }

  return result;
}
