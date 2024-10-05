import { Target } from "./config.js";
import { environment } from "./environment.js";
import { exec } from "./lib/exec.js";

export function tarExtension(gzip: boolean) {
  return gzip ? "tar.gz" : "tar";
}

export async function tarballFolder(target: Target) {
  const start = performance.now();

  const targetTarName = `out/${target.name}.${tarExtension(target.gzip)}`;

  const excludeFlags = target.exclude.map((e) => `--exclude=${e}`).join(" ");

  await exec(`tar -cf ${targetTarName} ${excludeFlags} -C ${target.path} .`);

  await exec(`chown -R ${environment.UID}:${environment.GID} ${targetTarName}`);

  return { timeMs: performance.now() - start, targetTarName };
}
