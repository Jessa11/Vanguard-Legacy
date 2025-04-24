const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '!unverify',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) return;

    const mention = message.mentions.members.first();
    if (!mention) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ I-mention ang user. Halimbawa: `!unverify @user`')
          .setColor(0xFF0000)]
      });
    }

    const discordId = mention.id;
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const member = await guild.members.fetch(discordId);

      await member.roles.remove(process.env.ROLE_ID).catch(() => {});
      await member.setNickname(null).catch(() => {});
      await client.db.execute("UPDATE discord_verification SET verified = 0, notified = 0, ign = NULL WHERE discord_id = ?", [discordId]);

      await message.reply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Unverified')
          .setDescription(`Na-unverify si **${mention.displayName}**.`)
          .setColor(0xFFAA00)]
      });

      await mention.send({
        embeds: [new EmbedBuilder()
          .setDescription('🔁 Na-unverify ka na. Pwede ka ulit mag-`!verify`.')
          .setColor(0xFFAA00)]
      });

    } catch (err) {
      console.error('❌ Error sa unverification:', err);
      message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ Hindi ma-unverify ang user.')
          .setColor(0xFF0000)]
      });
    }
  }
};
