import { environment } from "./environment.js";

const endpoint = "https://discord.com/api/v10";

export async function sendMessage(content: string) {
  if (content.length >= 2000) {
    content = content.slice(0, 1996) + "...";
    console.log("sendMessage WARN: Message too long, truncating...");
  }

  console.log("Sending message to discord...");

  const res = await fetch(
    `${endpoint}/channels/${environment.DISCORD_CHANNEL_ID}/messages`,
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
