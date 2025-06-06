import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { CreateTicket } from "../../commands/tickets/createTicket.js";
import { DeleteTicketCommand } from "../../commands/tickets/deleteTicket.js";
import { SaveTicketCommand } from "../../commands/tickets/saveTicket.js";

@Discord()
export class TicketButtonEvents {
  @On({ event: "interactionCreate" })
  async onInteractionCreate([interaction]: ArgsOf<"interactionCreate">) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "ticket_create") {
      const createTicketCommand = new CreateTicket();
      await createTicketCommand.doCreate(interaction);
    }

    if (interaction.customId === "ticket_close") {
      const deleteTicketCommand = new DeleteTicketCommand();
      await deleteTicketCommand.doClose(interaction);
    }

    if (interaction.customId === "ticket_save") {
      const saveTicketCommand = new SaveTicketCommand();
      await saveTicketCommand.doSave(interaction);
    }


  }
}
