const { EmbedBuilder } = require('discord.js');
const checkServerStatus = require('../utils/sampQuery');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const statusChannel = await guild.channels.fetch(process.env.STATUS_CHANNEL_ID);

    // 🔁 Auto-role assign loop
    setInterval(async () => {
      try {
        const [rows] = await client.db.execute("SELECT discord_id FROM discord_verification WHERE verified = 1 LIMIT 5");
        for (const row of rows) {
          const member = await guild.members.fetch(row.discord_id).catch(() => null);
          if (member) {
            await member.roles.add(process.env.ROLE_ID);
            await client.db.execute("UPDATE discord_verification SET verified = 2 WHERE discord_id = ?", [row.discord_id]);
          }
        }
      } catch (err) {
        console.error("❌ Auto-role error:", err);
      }
    }, 5000);

    // 👤 Nickname sync + notify loop
    setInterval(async () => {
      try {
        const [rows] = await client.db.execute("SELECT discord_id, ign FROM discord_verification WHERE verified = 1 AND notified = 0 AND ign IS NOT NULL");
        for (const row of rows) {
          const user = await client.users.fetch(row.discord_id).catch(() => null);
          const member = await guild.members.fetch(row.discord_id).catch(() => null);
          if (user && member) {
            await user.send("🎉 Na-verify ka na at naka-sync na ang iyong in-game name!");
            await member.setNickname(row.ign).catch(err => {
              console.warn(`⚠️ Hindi ma-set ang nickname para kay ${row.discord_id}:`, err.message);
            });
            await member.roles.add(process.env.ROLE_ID).catch(() => {});
            await client.db.execute("UPDATE discord_verification SET notified = 1 WHERE discord_id = ?", [row.discord_id]);
          }
        }
      } catch (err) {
        console.error("❌ Error sa verification sync:", err);
      }
    }, 10000);

    // 📡 Server Status Update Loop
    setInterval(async () => {
      try {
        const isOnline = await checkServerStatus(process.env.SAMP_IP, parseInt(process.env.SAMP_PORT));
        const embed = new EmbedBuilder()
          .setTitle('🛰️ SA-MP Server Status')
          .setDescription(isOnline ? '✅ Online ang server!' : '❌ Offline ang server.')
          .setColor(isOnline ? 0x00B050 : 0xFF0000)
          .setTimestamp();

        await statusChannel.bulkDelete(10, true).catch(() => {}); // linisin channel
        await statusChannel.send({ embeds: [embed] });
      } catch (err) {
        console.error("❌ Error sa status update:", err);
      }
    }, 15000);
  },
};
