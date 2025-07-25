import { Target } from "../config.js";
import { environment } from "../environment.js";
import { createExcludeFlagsForTarball } from "./exclude.js";
import { exec } from "./exec.js";

export function tarExtension(gzip: boolean) {
  return gzip ? "tar.gz" : "tar";
}

export async function tarballFolder(target: Target) {
  if (target.uploadType === "folder") {
    return {
      timeMs: 0,
      targetTarName: target.path,
    };
  }

  const start = performance.now();

  const targetTarName = `out/${target.name}.${tarExtension(target.uploadType === "tar.gz")}`;

  const excludeFlags = createExcludeFlagsForTarball(target.exclude);

  await exec(
    `tar ${target.uploadType === "tar.gz" ? "-czf" : "-cf"} ${targetTarName} ${excludeFlags} -C ${target.path} .`,
  );

  await exec(`chown -R ${environment.UID}:${environment.GID} ${targetTarName}`);

  return { timeMs: performance.now() - start, targetTarName };
}
