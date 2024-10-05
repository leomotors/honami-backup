import { z } from "zod";

import { Config, isPostgresEnabled, targetSchema } from "./config.js";

export function createTargets(
  config: Config,
  snapshotName: string | undefined,
): z.infer<typeof targetSchema>[] {
  const targets = config.targets;

  if (isPostgresEnabled(config)) {
    targets.push({
      name: "pgdump",
      path: "./pgdump",
      exclude: [],
      gzip: true,
    });
  }

  if (snapshotName) {
    targets.push({
      name: "prometheus",
      path: `${config.prometheus?.folderPath}/snapshots/${snapshotName}`,
      exclude: [],
      gzip: false,
    });
  }

  return targets;
}
