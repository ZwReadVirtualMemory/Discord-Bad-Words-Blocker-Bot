const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } = require('discord.js');
const { saveGuildConfig } = require('../utils/config-manager');
const { isAuthorized } = require('../utils/auth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wipebotdata')
    .setDescription('DANGER: Completely resets the bot configuration for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName('confirm')
       .setDescription('Type "WIPE" to confirm.')
       .setRequired(true)),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({ content: '❌ Unauthorized.', ephemeral: true });
    }

    const confirm = interaction.options.getString('confirm');
    if (confirm !== 'WIPE') {
      return interaction.reply({ content: '❌ You must type `WIPE` to confirm.', ephemeral: true });
    }

    const emptyConfig = {
      logChannelId: null,
      blockedWordsChannelId: null,
      ignoredRoles: '',
      ignoredChannels: [],
      channelRoleOverrides: {},
      adminRoles: [],
      autoMuteEnabled: false,
      messageDeleteTimeout: 5000
    };

    saveGuildConfig(interaction.guild.id, emptyConfig);

    const embed = new EmbedBuilder()
      .setColor(Colors.DarkRed)
      .setTitle('Bot Data Wiped')
      .setDescription('All server-specific settings have been reset to default. Global blocked words were not affected.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
