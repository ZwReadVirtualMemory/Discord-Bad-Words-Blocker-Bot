require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const commands     = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`[Deploy] Queued: /${command.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log(`[Deploy] Registering ${commands.length} application command(s) locally...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1491847488444043315'),
      { body: commands }
    );

    console.log(`[Deploy] Successfully registered ${data.length} command(s) for the server.`);
    console.log('[Deploy] Commands should appear instantly.');
  } catch (err) {
    console.error('[Deploy] Registration failed:', err);
  }
})();
