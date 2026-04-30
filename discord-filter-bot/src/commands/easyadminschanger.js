const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } = require('discord.js');
const { getGuildConfig, saveGuildConfig } = require('../utils/config-manager');
const { isAuthorized } = require('../utils/auth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('easyadminschanger')
    .setDescription('Bulk update administrator roles using a list of IDs.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName('ids')
       .setDescription('Comma or space separated role IDs (e.g. 123456, 789012).')
       .setRequired(true)),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({ content: '❌ Unauthorized.', ephemeral: true });
    }

    const input = interaction.options.getString('ids');
    const ids   = input.split(/(?:,\s*|\s+)/).map(id => id.trim()).filter(id => /^\d{17,20}$/.test(id));

    if (!ids.length) {
      return interaction.reply({ content: '❌ No valid role IDs found. Please provide numeric IDs.', ephemeral: true });
    }

    const cfg = getGuildConfig(interaction.guild.id);
    cfg.adminRoles = ids;
    saveGuildConfig(interaction.guild.id, cfg);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('Admin Roles Updated')
      .setDescription(`Successfully set **${ids.length}** administrator roles.`)
      .addFields({ name: 'Role IDs', value: ids.map(id => `<@&${id}>`).join(' ') })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
