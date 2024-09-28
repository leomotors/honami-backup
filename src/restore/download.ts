import { environment } from "../environment.js";
import { exec } from "../lib/exec.js";

export async function downloadBalls() {
  const start = performance.now();

  await exec("mkdir -p download");

  const { stderr, stdout } = await exec(
    `rclone sync ${environment.RCLONE_FOLDER} download`,
  );

  if (stdout || stderr) {
    console.error(`Error when downloading: stdout=${stdout} stderr=${stderr}`);
  }

  const durationMs = performance.now() - start;
  const duration = (durationMs / 1000).toFixed(3);

  const { stdout: folderSizeOutput } = await exec("du -s download");
  // In GiB
  const folderSize = +folderSizeOutput.split("\t")[0]! / 1048576;

  console.log(`Downloaded ${folderSize.toFixed(4)} GiB in ${duration} seconds`);
}
