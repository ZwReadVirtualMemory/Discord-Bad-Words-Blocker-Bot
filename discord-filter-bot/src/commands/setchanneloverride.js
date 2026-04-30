const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  ChannelType
} = require('discord.js');

const { getGuildConfig, saveGuildConfig } = require('../utils/config-manager');
const { isAuthorized } = require('../utils/auth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchanneloverride')
    .setDescription('Set whether a role is immune to the filter in a specific channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addRoleOption(o =>
      o.setName('role')
       .setDescription('The role to configure.')
       .setRequired(true))

    .addChannelOption(o =>
      o.setName('channel')
       .setDescription('The channel this override applies to.')
       .addChannelTypes(ChannelType.GuildText)
       .setRequired(true))

    .addStringOption(o =>
      o.setName('ignore')
       .setDescription('"yes" = immune, "no" = not immune, "clear" = remove override.')
       .setRequired(true)
       .addChoices(
         { name: 'Yes — immune in this channel',              value: 'yes'   },
         { name: 'No  — not immune in this channel',          value: 'no'    },
         { name: 'Clear — remove override (use global setting)', value: 'clear' }
       )),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({
        content: '❌ You are not authorized to manage this bot.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const role    = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');
    const choice  = interaction.options.getString('ignore');

    const cfg = getGuildConfig(interaction.guild.id);

    if (!cfg.channelRoleOverrides)              cfg.channelRoleOverrides = {};
    if (!cfg.channelRoleOverrides[channel.id])  cfg.channelRoleOverrides[channel.id] = {};

    let statusText;

    if (choice === 'yes') {
      cfg.channelRoleOverrides[channel.id][role.id] = true;
      statusText = `<@&${role.id}> is immune to the filter in <#${channel.id}>.`;
    } else if (choice === 'no') {
      cfg.channelRoleOverrides[channel.id][role.id] = false;
      statusText = `<@&${role.id}> is NOT immune to the filter in <#${channel.id}> (overrides global setting).`;
    } else {
      delete cfg.channelRoleOverrides[channel.id][role.id];

      if (!Object.keys(cfg.channelRoleOverrides[channel.id]).length) {
        delete cfg.channelRoleOverrides[channel.id];
      }

      statusText = `Override cleared for <@&${role.id}> in <#${channel.id}>. Global setting now applies.`;
    }

    saveGuildConfig(interaction.guild.id, cfg);

    const embed = new EmbedBuilder()
      .setColor(choice === 'yes' ? Colors.Green : choice === 'no' ? Colors.Red : Colors.Yellow)
      .setTitle('Channel Role Override Updated')
      .setDescription(statusText)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
