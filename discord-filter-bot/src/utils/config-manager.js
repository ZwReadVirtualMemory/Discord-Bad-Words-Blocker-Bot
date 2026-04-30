const fs   = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../config.json');
const WORDS_FILE  = path.join(__dirname, '../../discord_bad_words.txt');

let config = { guilds: {} };
if (fs.existsSync(CONFIG_FILE)) {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function getGuildConfig(guildId) {
  if (!config.guilds[guildId]) {
    config.guilds[guildId] = {
      logChannelId: null,
      ignoredRoles: '',
      ignoredChannels: [],
      channelRoleOverrides: {},
      adminRoles: [],
      autoMuteEnabled: false,
      messageDeleteTimeout: 5000
    };
  }
  return config.guilds[guildId];
}

function isSetupComplete(guildId) {
  const cfg = getGuildConfig(guildId);
  return cfg.logChannelId !== null && cfg.logChannelId !== undefined;
}

function saveGuildConfig(guildId, cfg) {
  config.guilds[guildId] = cfg;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getBlockedWords() {
  if (!fs.existsSync(WORDS_FILE)) return [];
  const content = fs.readFileSync(WORDS_FILE, 'utf8');
  return content
    .split(',')
    .map(w => w.trim().replace(/^_+/, ''))
    .filter(w => w.length > 0);
}

module.exports = {
  getGuildConfig,
  saveGuildConfig,
  getBlockedWords,
  isSetupComplete
};
