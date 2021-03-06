import { Client } from "discord.js";
import { validateEnv } from "./utils/validateEnv";
import { IntentOptions } from './config/IntentOptions'
import { onInteraction } from "./events/onInteraction";
import { onReady } from "./events/onReady";

(async () => {
  if (!validateEnv()) return;

  const BOT = new Client({intents: IntentOptions});

  BOT.on("ready", async () => await onReady(BOT));
  BOT.on(
    "interactionCreate",
    async (interaction) => await onInteraction(interaction)
  );

  await BOT.login(process.env.BOT_TOKEN);
})();