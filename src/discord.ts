import { Routes } from "discord-api-types/v10";

import { environment } from "./environment.js";

const endpoint = "https://discord.com/api/v10";

export async function sendMessage(content: string) {
  if (content.length >= 4000) {
    content = content.slice(0, 3996) + "...";
    console.log("sendMessage WARN: Message too long, truncating...");
  }

  console.log("Sending message to discord...");

  const res = await fetch(
    endpoint + Routes.channelMessages(environment.DISCORD_CHANNEL_ID),
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${environment.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!res.ok) {
    console.error(`Discord API Failed ${res.status} ${res.statusText}`);
    console.error(await res.text());
  }
}
