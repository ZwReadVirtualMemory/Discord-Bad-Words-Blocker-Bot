const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  StringSelectMenuBuilder,
  ChannelType
} = require('discord.js');

const { getGuildConfig, saveGuildConfig } = require('../utils/config-manager');
const { isAuthorized } = require('../utils/auth');

function fmtRoles(ids)    { return ids && ids.length ? ids.map(id => `<@&${id}>`).join(', ') : '`None`'; }
function fmtChannels(ids) { return ids && ids.length ? ids.map(id => `<#${id}>`).join(', ')  : '`None`'; }
function fmtCSVRoles(csvStr) { 
  if (!csvStr || csvStr.trim() === '') return '`None`';
  return csvStr.split(',').map(id => id.trim()).filter(id => id).map(id => `<@&${id}>`).join(', ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure the bot using an interactive menu.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({ content: '❌ Unauthorized.', ephemeral: true });
    }

    const cfg = getGuildConfig(interaction.guild.id);

    const generateEmbed = (currentCfg) => {
      return new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle('Bot Configuration Menu')
        .setDescription('Configure the bot settings using the options below.')
        .addFields(
          { name: 'Logs Channel',            value: currentCfg.logChannelId          ? `<#${currentCfg.logChannelId}>` : '`Not set`', inline: true },
          { name: 'Admin Roles',             value: fmtRoles(currentCfg.adminRoles ?? []),    inline: false },
          { name: 'Globally Ignored Roles',  value: fmtCSVRoles(currentCfg.ignoredRoles),     inline: false },
          { name: 'Auto Timeout (6 violations)', value: currentCfg.autoMuteEnabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Message Delete Timeout', value: `${currentCfg.messageDeleteTimeout || 5000}ms`, inline: true }
        )
        .setTimestamp();
    };

    const rows = [
      new ActionRowBuilder().addComponents(
        new RoleSelectMenuBuilder()
          .setCustomId('setup:admin_roles')
          .setPlaceholder('Select Administrator Roles')
          .setMinValues(0).setMaxValues(10)
      ),
      new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId('setup:log_channel')
          .setPlaceholder('Select Logging Channel')
          .addChannelTypes(ChannelType.GuildText)
          .setMinValues(0).setMaxValues(1)
      ),
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup:auto_mute')
          .setPlaceholder('Toggle Auto Timeout After 6 Violations')
          .addOptions([
            { label: 'Enable Auto Timeout', value: 'enable' },
            { label: 'Disable Auto Timeout', value: 'disable' }
          ])
      ),
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup:message_timeout')
          .setPlaceholder('Message Deletion Timeout')
          .addOptions([
            { label: '2 seconds', value: '2000' },
            { label: '5 seconds', value: '5000' },
            { label: '10 seconds', value: '10000' },
            { label: '15 seconds', value: '15000' },
            { label: '30 seconds', value: '30000' }
          ])
      )
    ];

    const response = await interaction.reply({
      embeds: [generateEmbed(cfg)],
      components: rows,
      ephemeral: true
    });

    const collector = response.createMessageComponentCollector({
      time: 120000
    });

    collector.on('collect', async i => {
      try {
        const cfgUpdate = getGuildConfig(i.guild.id);

        if (i.customId === 'setup:admin_roles') {
          cfgUpdate.adminRoles = i.values;
        } else if (i.customId === 'setup:log_channel') {
          cfgUpdate.logChannelId = i.values[0] || null;
        } else if (i.customId === 'setup:auto_mute') {
          cfgUpdate.autoMuteEnabled = i.values[0] === 'enable';
        } else if (i.customId === 'setup:message_timeout') {
          cfgUpdate.messageDeleteTimeout = parseInt(i.values[0], 10);
        }

        saveGuildConfig(i.guild.id, cfgUpdate);
        await i.update({ embeds: [generateEmbed(cfgUpdate)], components: rows });
      } catch (err) {
        console.error('[Setup] Collector error:', err);
        if (!i.replied && !i.deferred) {
          await i.reply({ content: 'Error updating configuration.', ephemeral: true }).catch(() => {});
        }
      }
    });

    await interaction.followUp({
      content: 'To set ignored roles, use: `/setignoredroles` with format `roleid,roleid,roleid`',
      ephemeral: true
    }).catch(() => {});
  }
};
