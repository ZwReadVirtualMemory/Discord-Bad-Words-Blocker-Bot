module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`[Commands] Unknown command received: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[Commands] Error in /${interaction.commandName}:`, err);

      const reply = { content: '[ Internal Error]  An internal error occurred executing this command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => { });
      } else {
        await interaction.reply(reply).catch(() => { });
      }
    }
  }
};
