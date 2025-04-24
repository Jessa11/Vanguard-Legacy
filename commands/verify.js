const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '!verify',
  async execute(message, args, client) {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(message.author.id).catch(() => null);

    if (member && member.roles.cache.has(process.env.ROLE_ID)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setDescription("✅ Verified ka na!")
          .setColor(0x00B0F4)]
      });
    }

    const code = Math.floor(1000 + Math.random() * 9000);

    try {
      await client.db.execute(
        'REPLACE INTO discord_verification (discord_id, code, verified) VALUES (?, ?, 0)',
        [message.author.id, code]
      );

      await message.author.send({
        embeds: [new EmbedBuilder()
          .setTitle('🔐 Verification Code')
          .setDescription(`Ang verification code mo ay: \`${code}\`\nI-type ito sa SA-MP: \`/verify ${code}\``)
          .setColor(0x00B0F4)]
      });

      await message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('📬 Ipinadala ko ang verification code mo sa iyong DMs!')
          .setColor(0x00B0F4)]
      });

    } catch (err) {
      console.error(err);
      await message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ Hindi ko ma-DM. Buksan mo muna ang DMs mo.')
          .setColor(0xFF0000)]
      });
    }
  }
};
