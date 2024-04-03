import { z } from "zod";

const environmentSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_CHANNEL_ID: z.string(),

  BACKUP_PATH: z.string(),

  ACCOUNT_NAME: z.string(),
  ACCOUNT_KEY: z.string(),
  CONTAINER_NAME: z.string(),

  EXCLUDE_REPOS_FLAG: z.string(),

  PROMETHEUS_URL: z.string().regex(/^http/),
  PROMETHEUS_TOKEN: z.string(),
});

export const environment = environmentSchema.parse(process.env);
