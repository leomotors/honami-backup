import { exec } from "./lib/exec.js";

export async function tarballFolder(target: string) {
  const start = performance.now();

  const targetFileName = target.split("/").at(-1);

  await exec(
    `tar -czf out/${targetFileName}.tar.gz --exclude=postgres-data --exclude=gitea-data/ssh --exclude=gitea-data/git/repositories/carelessdev -C ${target} .`,
  );

  return performance.now() - start;
}
