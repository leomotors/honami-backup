import { z } from "zod";

const environmentSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_CHANNEL_ID: z.string(),

  BACKUP_PATH: z.string(),

  ACCOUNT_NAME: z.string(),
  ACCOUNT_KEY: z.string(),
  CONTAINER_NAME: z.string(),
});

export const environment = environmentSchema.parse(process.env);
