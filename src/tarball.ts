import { exec } from "./lib/exec.js";
import { Target } from "./targets.js";

export async function tarballFolder(target: Target) {
  const start = performance.now();

  await exec(
    `sudo tar -czf out/${target.name}.tar.gz ${target.exclude || ""} -C ${target.path} .`,
  );

  await exec(`sudo chown -R 1000:1003 out/${target.name}.tar.gz`);

  return performance.now() - start;
}
