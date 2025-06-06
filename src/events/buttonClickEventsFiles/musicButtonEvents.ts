import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { SkipCommand } from "../../commands/music/skip.js";
import { StopCommand } from "../../commands/music/stop.js";

@Discord()
export class MusicButtonEvents {
  @On({ event: "interactionCreate" })
  async onInteractionCreate([interaction]: ArgsOf<"interactionCreate">) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "music_skip") {
      const skipCommand = new SkipCommand();
      await skipCommand["doSkip"](interaction);
    }

    // Alternatively for music_skip option
    if (interaction.customId === "music_next") {
      const skipCommand = new SkipCommand();
      await skipCommand["doSkip"](interaction);
    }

    if (interaction.customId === "music_stop") {
      const stopCommand = new StopCommand();
      await stopCommand["doStop"](interaction)

    }
  }
}
