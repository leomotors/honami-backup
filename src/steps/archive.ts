import { environment } from "../environment.js";
import { exec } from "../lib/exec.js";
import { tarballFolder } from "../tarball.js";

export async function archiveBalls() {
  await exec("rm -rf out && mkdir -p out");

  const appTime = await tarballFolder(environment.BACKUP_PATH + "/apps");
  console.log(
    `Successfully archived apps in ${(appTime / 1000).toFixed(3)} seconds`,
  );

  const selfhostTime = await tarballFolder(
    environment.BACKUP_PATH + "/selfhost",
  );

  console.log(
    `Successfully archived selfhost in ${(selfhostTime / 1000).toFixed(
      3,
    )} seconds`,
  );
}
