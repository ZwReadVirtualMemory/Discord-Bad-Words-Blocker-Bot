const { getGuildConfig } = require('./config-manager');

// Whitelisted roles for the specific server
const WHITELIST_GUILD_ID = '1491096000868257943';
const WHITELIST_ROLES = ['1491126863504998400', '1491127418499633334', '1491096205386580078'];

function isAuthorized(interaction) {
  // If this is the whitelisted server, only allow specific roles
  if (interaction.guild.id === WHITELIST_GUILD_ID) {
    return interaction.member.roles.cache.some(role => WHITELIST_ROLES.includes(role.id));
  }

  // For other servers, use the configured admin roles
  const cfg = getGuildConfig(interaction.guild.id);
  const adminRoles = cfg.adminRoles || [];

  if (adminRoles.length === 0) {
    return true;
  }

  if (interaction.guild.ownerId === interaction.user.id) {
    return true;
  }

  return interaction.member.roles.cache.some(role => adminRoles.includes(role.id));
}

module.exports = { isAuthorized };
