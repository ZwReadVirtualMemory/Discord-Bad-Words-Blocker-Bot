const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors
} = require('discord.js');

const { getGuildConfig, saveGuildConfig } = require('../utils/config-manager');
const { isAuthorized } = require('../utils/auth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setignoredroles')
    .setDescription('Set roles immune to the word filter using CSV format.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName('roles')
        .setDescription('Comma-separated role IDs (e.g., 123456789,987654321)')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({
        content: '❌ You are not authorized to manage this bot.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const input = interaction.options.getString('roles');
    const cfg = getGuildConfig(interaction.guild.id);

    const roleIds = input
      .split(',')
      .map(id => id.trim())
      .filter(id => /^\d+$/.test(id));

    if (roleIds.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('Invalid Input')
        .setDescription('No valid role IDs provided. Use format: `roleid,roleid,roleid`');
      return await interaction.editReply({ embeds: [embed] });
    }

    cfg.ignoredRoles = roleIds.join(',');
    saveGuildConfig(interaction.guild.id, cfg);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('Ignored Roles Updated')
      .addFields(
        { 
          name: 'Current Ignored Roles', 
          value: roleIds.map(id => `<@&${id}>`).join(', '), 
          inline: false 
        }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
