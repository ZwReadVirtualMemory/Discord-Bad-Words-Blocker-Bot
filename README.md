# Discord-Bad-Words-Blocker-Bot
This was custom commission, but it's was never used on any public servers so i decided to leak it on my github.

## Installation (One-time setup)

1. Install dependencies:
   ```powershell
   npm install
   ```
   *(If npm has issues, the dependencies should already be installed in node_modules)*

2. In `.env` file in the root folder with:
   ```
   BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

## Starting the Bot

```powershell
cd "c:\Users\YOURUSER\OneDrive\Desktop\w.i.p stuff\discord-filter-bot"  (where folder with bot located on your pc)
node src/index.js
```

The bot will start and display:
```
[Loader] Loaded command: /setup
[Loader] Loaded command: /words
...
[Bot] Logged in as calamari ban word testing bot#5824 — serving 1 guild(s).
```

## Deploy Slash Commands (Run once after setup)

```powershell
node src/deploy-commands.js
```

## Configuration

After bot starts, run `/setup` in your Discord server to configure:
- **Logs Channel** (required) - where blocked messages are logged
- **Admin Roles** (optional) - who can configure the bot
- **Auto Timeout** (optional) - auto-timeout users after 6 violations
- **Message Delete Timeout** - how long before logged messages auto-delete

## Discord Developer Portal Settings

1. **Message Content Intent** — Bot Settings → Privileged Gateway Intents → enable `MESSAGE CONTENT INTENT`
2. **Server Members Intent** — enable `SERVER MEMBERS INTENT` (needed for role resolution)
3. **Bot Permissions** — when generating invite link, grant:
   - `Manage Messages` (delete flagged messages)
   - `Send Messages`
   - `Embed Links`
   - `Moderate Members` (for timeouts)
