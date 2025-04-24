const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '!players',
  async execute(message, args, client) {
    try {
      const [players] = await client.db.execute("SELECT name, level FROM players WHERE online = 1 ORDER BY level DESC LIMIT 100");
      const list = players.map(p => `**${p.name}** (Level ${p.level})`).join('\n') || '*Walang online na players.*';

      const embed = new EmbedBuilder()
        .setTitle('👥 Online Players')
        .setDescription(list)
        .setFooter({ text: `Total: ${players.length}` })
        .setColor(0x00B0F4);

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ Hindi makuha ang listahan ng players.')
          .setColor(0xFF0000)]
      });
    }
  }
};
