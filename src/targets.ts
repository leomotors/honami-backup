import { z } from "zod";

import {
  Config,
  isPostgresEnabled,
  isPrometheusEnabled,
  targetSchema,
} from "./config.js";

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
      gzip: config.postgres.compress,
    });
  }

  if (isPrometheusEnabled(config) && snapshotName) {
    targets.push({
      name: "prometheus",
      path: `${config.prometheus.folderPath}/snapshots/${snapshotName}`,
      exclude: [],
      gzip: config.prometheus.compress,
    });
  }

  return targets;
}
