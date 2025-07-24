import fs from "node:fs/promises";

import { parse as yamlParse } from "yaml";
import { z } from "zod";

import { environment } from "./environment.js";

export const uploadType = z.enum(["folder", "tar", "tar.gz"]);

export const targetSchema = z.object({
  name: z.string().regex(/^[a-zA-Z0-9-_]+$/),
  path: z.string(),
  exclude: z.array(z.string()).default([]),
  uploadType: uploadType.default("tar"),
  checksum: z.boolean().default(true),
});

export type Target = z.infer<typeof targetSchema>;

export const prometheusSchema = z.object({
  url: z.string(),
  token: z.string(),
  folderPath: z.string(),
  uploadType: uploadType.default("folder"),
});

export const pgSchema = z.object({
  containerName: z.string(),
  rootUsername: z.string().default("postgres"),
  uploadType: uploadType.default("tar.gz"),
});

export const configSchema = z.object({
  targets: z.array(targetSchema),
  prometheus: prometheusSchema.optional(),
  postgres: pgSchema.optional(),
});

export type Config = z.infer<typeof configSchema>;

export type ConfigPrometheusEnabled = Config &
  Required<Pick<Config, "prometheus">>;
export function isPrometheusEnabled(
  config: Config,
): config is ConfigPrometheusEnabled {
  return config.prometheus !== undefined;
}

export type ConfigPostgresEnabled = Config & Required<Pick<Config, "postgres">>;
export function isPostgresEnabled(
  config: Config,
): config is ConfigPostgresEnabled {
  return config.postgres !== undefined;
}

export async function readConfig() {
  const config = await fs.readFile(environment.CONFIG_PATH, "utf-8");
  return configSchema.parse(yamlParse(config));
}
