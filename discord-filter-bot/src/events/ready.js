module.exports = {
  name:  'ready',
  once:  true,

  execute(client) {
    console.log(`[Bot] Logged in as ${client.user.tag} — serving ${client.guilds.cache.size} guild(s).`);
  }
};
