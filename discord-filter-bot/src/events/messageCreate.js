const { EmbedBuilder, Colors } = require('discord.js');
const { getGuildConfig, isSetupComplete } = require('../utils/config-manager');
const { scanMessage } = require('../utils/filter');
const fs = require('fs');
const path = require('path');

const WORDS_FILE = path.join(__dirname, '../../discord_bad_words.txt');

function getBlockedWords() {
  if (!fs.existsSync(WORDS_FILE)) return [];
  const content = fs.readFileSync(WORDS_FILE, 'utf8');
  return content
    .split(',')
    .map(w => w.trim().replace(/^_+/, ''))
    .filter(w => w.length > 0);
}

function isMemberImmune(member, channelId, guildConfig) {
  const ignoredRoleIds = guildConfig.ignoredRoles
    ? guildConfig.ignoredRoles.split(',').map(id => id.trim()).filter(id => id)
    : [];
  const channelOverrides = guildConfig.channelRoleOverrides[channelId] ?? {};

  for (const roleId of member.roles.cache.keys()) {
    if (roleId in channelOverrides) {
      if (channelOverrides[roleId] === true)  return true;
      if (channelOverrides[roleId] === false) continue;
    }

    if (ignoredRoleIds.includes(roleId)) return true;
  }

  return false;
}

const userViolations = new Map();

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (message.author.bot)  return;
    if (!message.guild)      return;

    // Check if setup is complete before moderating
    if (!isSetupComplete(message.guild.id)) return;

    const guildConfig  = getGuildConfig(message.guild.id);
    const blockedWords = getBlockedWords();

    if (!blockedWords.length) return;

    if (guildConfig.ignoredChannels?.includes(message.channel.id)) return;

    if (isMemberImmune(message.member, message.channel.id, guildConfig)) {
      return;
    }

    const { triggered, word } = scanMessage(message.content, blockedWords);
    if (!triggered) return;

    try {
      await message.delete();
    } catch {}

    let isTimedOut = false;
    if (guildConfig.autoMuteEnabled && !isMemberImmune(message.member, message.channel.id, guildConfig)) {
      const key = `${message.guild.id}:${message.author.id}`;
      const currentViolations = (userViolations.get(key) || 0) + 1;
      userViolations.set(key, currentViolations);

      if (currentViolations >= 6) {
        try {
          if (message.member.moderatable) {
            await message.member.timeout(5 * 60 * 1000, 'Mass spam of banned words');
            isTimedOut = true;
          }
        } catch (err) {
          console.error('[Error] Failed to timeout user:', err.message);
        }
        userViolations.delete(key);
      }
    }

    if (!guildConfig.logChannelId) return;

    const logChannel = message.guild.channels.cache.get(guildConfig.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(isTimedOut ? Colors.Red : 14942208)
      .setTitle(isTimedOut ? 'User Timed Out - Message Blocked' : 'Message Blocked')
      .setThumbnail(message.author.displayAvatarURL({ size: 64 }))
      .addFields(
        { name: 'User',            value: `${message.author} (${message.author.tag})`, inline: true },
        { name: 'Channel',         value: `${message.channel}`,                        inline: true },
        { name: 'Violations',      value: `${(userViolations.get(`${message.guild.id}:${message.author.id}`) || 0)}`, inline: true },
        { name: 'Triggered Word',  value: `\`${word}\``,                               inline: false },
        { name: 'Message Content', value: message.content.slice(0, 1024) || '*(empty)*', inline: false }
      );
    
    if (isTimedOut) {
      embed.addFields({ name: 'Action', value: 'User has been timed out for 5 minutes after 6 violations', inline: false });
    }
    
    embed.setTimestamp().setFooter({ text: `User ID: ${message.author.id}` });

    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
};
