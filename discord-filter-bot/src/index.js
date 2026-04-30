require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (!command.data || !command.execute) {
    console.warn(`[Loader] Skipping ${file}: missing "data" or "execute" export.`);
    continue;
  }

  client.commands.set(command.data.name, command);
  console.log(`[Loader] Loaded command: /${command.data.name}`);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }

  console.log(`[Loader] Registered event: ${event.name}${event.once ? ' (once)' : ''}`);
}

client.login(process.env.BOT_TOKEN).catch(err => {
  console.error('[Fatal] Failed to login:', err.message);
  process.exit(1);
});
