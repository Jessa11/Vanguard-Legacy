const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '!help',
  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setTitle('📘 Bot Commands')
      .setDescription(
        '**!verify** - I-link ang iyong Discord sa iyong SA-MP account.\n' +
        '**!unverify @user** - I-unverify ang isang user (Admin only).\n' +
        '**!ip** - Ipakita ang IP ng server.\n' +
        '**!players** - Ipakita ang mga online na players.\n' +
        '**!help** - Ipakita ang tulong na ito.\n\n' +
        '📌 Ang status ng server ay regular na ina-update sa status channel.'
      )
      .setFooter({ text: 'Vanguard Verification System by Jopay' })
      .setColor(0x00B0F4);

    message.reply({ embeds: [embed] });
  }
};
