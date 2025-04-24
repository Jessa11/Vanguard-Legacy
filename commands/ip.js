const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '!ip',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('🌐 Server IP')
      .setDescription(`\`${process.env.SAMP_IP}:${process.env.SAMP_PORT}\``)
      .setColor(0x00B0F4);

    message.reply({ embeds: [embed] });
  }
};
