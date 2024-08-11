import { exec } from "./lib/exec.js";
import { Target } from "./targets.js";

export const tarExtension = "tar";

export async function tarballFolder(target: Target) {
  const start = performance.now();

  await exec(
    `sudo tar -cf out/${target.name}.${tarExtension} ${target.exclude || ""} -C ${target.path} .`,
  );

  await exec(`sudo chown -R 1000:1003 out/${target.name}.${tarExtension}`);

  return performance.now() - start;
}
