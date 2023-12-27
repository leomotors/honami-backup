import { environment } from "./environment.js";
import { exec } from "./lib/exec.js";

export async function tarballFolder(target: string) {
  const start = performance.now();

  const targetFileName = target.split("/").at(-1);

  await exec(
    `sudo tar -czf out/${targetFileName}.tar.gz ${environment.EXCLUDE_FLAGS} -C ${target} .`,
  );

  await exec(`sudo chown -R 1000:1003 out/${targetFileName}.tar.gz`);

  return performance.now() - start;
}
