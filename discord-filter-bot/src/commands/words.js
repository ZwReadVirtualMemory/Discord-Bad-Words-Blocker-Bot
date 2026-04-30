const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors
} = require('discord.js');

const { isAuthorized } = require('../utils/auth');
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

function saveBlockedWords(words) {
  const uniqueWords = [...new Set(words.map(w => w.trim().toLowerCase()))].filter(w => w.length > 0);
  fs.writeFileSync(WORDS_FILE, uniqueWords.join(','), 'utf8');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('words')
    .setDescription('Manage the blocked words list.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sub =>
      sub.setName('add')
         .setDescription('Add words to the blocked list (comma separated).')
         .addStringOption(o =>
           o.setName('words')
            .setDescription('Words to block, comma separated (e.g., word1,word2,word3)')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(2000)))

    .addSubcommand(sub =>
      sub.setName('remove')
         .setDescription('Remove a word from the blocked list.')
         .addStringOption(o =>
           o.setName('word')
            .setDescription('The exact word to unblock.')
            .setRequired(true)))

    .addSubcommand(sub =>
      sub.setName('list')
         .setDescription('View the full blocked words list.'))

    .addSubcommand(sub =>
      sub.setName('clear')
         .setDescription('Clear ALL blocked words (requires confirmation).')
         .addStringOption(o =>
           o.setName('confirm')
            .setDescription('Type "CLEAR_ALL" to confirm.')
            .setRequired(true))),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({
        content: '❌ You are not authorized to manage this bot.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    let currentWords = getBlockedWords();

    if (sub === 'add') {
      const input = interaction.options.getString('words');
      const newWordsInput = input.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
      
      const added = [];
      const dupes = [];

      for (const word of newWordsInput) {
        if (currentWords.includes(word) || added.includes(word)) {
          dupes.push(word);
        } else {
          added.push(word);
        }
      }

      if (added.length === 0) {
        return interaction.editReply({ 
          content: `⚠️ No new words added. ${dupes.length} duplicate(s) found.` 
        });
      }

      currentWords.push(...added);
      saveBlockedWords(currentWords);

      let msg = `✅ Added **${added.length}** word(s) to blocklist.`;
      if (dupes.length > 0) msg += ` (${dupes.length} duplicate(s) skipped)`;
      msg += `\nTotal blocked words: **${currentWords.length}**`;

      const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(msg);

      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const word = interaction.options.getString('word').toLowerCase().trim();
      const idx = currentWords.indexOf(word);

      if (idx === -1) {
        return interaction.editReply({ content: `❌ Word \`${word}\` not found in blocklist.` });
      }

      currentWords.splice(idx, 1);
      saveBlockedWords(currentWords);

      const embed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setDescription(`✅ Removed \`${word}\` from blocklist.\nTotal blocked words: **${currentWords.length}**`);

      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'list') {
      if (currentWords.length === 0) {
        return interaction.editReply({ content: 'No words in blocklist.' });
      }

      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setDescription(`**${currentWords.length}** blocked word(s):\n\n${currentWords.slice(0, 50).join(', ')}`);

      if (currentWords.length > 50) {
        embed.addFields({ name: 'And more...', value: `+${currentWords.length - 50} more words` });
      }

      return interaction.editReply({ embeds: [embed], files: [{ attachment: WORDS_FILE, name: 'discord_bad_words.txt' }] });
    }

    if (sub === 'clear') {
      const confirm = interaction.options.getString('confirm');

      if (confirm !== 'CLEAR_ALL') {
        return interaction.editReply({ content: 'You must type exactly `CLEAR_ALL` to confirm deletion.' });
      }

      saveBlockedWords([]);

      const embed = new EmbedBuilder()
        .setColor(Colors.DarkRed)
        .setDescription('🗑️ All blocked words have been cleared.');

      return interaction.editReply({ embeds: [embed] });
    }
  }
};
