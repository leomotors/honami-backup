import { z } from "zod";

const environmentSchema = z.object({
  UID: z.coerce.string().default("1000"),
  GID: z.coerce.string().default("1000"),

  DISCORD_TOKEN: z.string(),
  DISCORD_CHANNEL_ID: z.string(),

  RCLONE_FOLDER: z.string(),

  DATABASE_URL: z.string(),

  CONFIG_PATH: z.string(),
});

export const environment = environmentSchema.parse(process.env);
