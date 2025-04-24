require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

let db;

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.trim().split(' ');
  const cmd = args[0];

  const verifyChannelId = process.env.VERIFY_CHANNEL_ID;
  const commandsChannelId = process.env.COMMANDS_CHANNEL_ID;
  const isAdmin = message.member.permissions.has('Administrator');

  if (['!verify', '!unverify'].includes(cmd) && message.channel.id !== verifyChannelId) {
    return message.reply({
      embeds: [new EmbedBuilder()
        .setDescription(`❌ Wrong channel. Please use this command in <#${verifyChannelId}>.`)
        .setColor(0xFF0000)]
    });
  }

  if (['!help', '!ip', '!players'].includes(cmd) && message.channel.id !== commandsChannelId) {
    return message.reply({
      embeds: [new EmbedBuilder()
        .setDescription(`❌ Wrong channel. Please use this command in <#${commandsChannelId}>.`)
        .setColor(0xFF0000)]
    });
  }

  if (cmd === '!help') {
    return message.reply({
      embeds: [new EmbedBuilder()
        .setTitle('📘 Bot Commands')
        .setDescription(
          '**!verify** - Link your Discord to your in-game account.\n' +
          '**!unverify @user** - Unverify a user (Admin only).\n' +
          '**!ip** - Show server IP.\n' +
          '**!players** - Show online players.\n' +
          '**!help** - Show this help message.'
        )
        .setColor(0x00B0F4)
        .setFooter({ text: 'Vanguard Verification System' })]
    });
  }

  if (cmd === '!ip') {
    return message.reply({
      embeds: [new EmbedBuilder()
        .setTitle('🌐 Server IP')
        .setDescription('`pew.samp-phc.xyz:7777`')
        .setColor(0x00B0F4)]
    });
  }

  if (cmd === '!unverify') {
    if (!isAdmin) return;

    const mention = message.mentions.members.first();
    if (!mention) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ Mention a user to unverify. Example: `!unverify @user`')
          .setColor(0xFF0000)]
      });
    }

    const discordId = mention.id;
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const member = await guild.members.fetch(discordId);

      await member.roles.remove(process.env.ROLE_ID).catch(() => {});
      await member.setNickname(null).catch(() => {});

      await db.execute("UPDATE discord_verification SET verified = 0, notified = 0, ign = NULL WHERE discord_id = ?", [discordId]);

      await message.reply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Unverified')
          .setDescription(`Successfully unverified **${mention.displayName}**.`)
          .setColor(0xFFAA00)]
      });

      await mention.send({
        embeds: [new EmbedBuilder()
          .setDescription('🔁 You have been unverified. You may use `!verify` again.')
          .setColor(0xFFAA00)]
      });

    } catch (err) {
      console.error('Error during unverification:', err);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ Failed to unverify user.')
          .setColor(0xFF0000)]
      });
    }
    return;
  }

  if (cmd === '!verify') {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(message.author.id).catch(() => null);

    if (member && member.roles.cache.has(process.env.ROLE_ID)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setDescription("✅ You're already verified!")
          .setColor(0x00B0F4)]
      });
    }

    const code = Math.floor(1000 + Math.random() * 9000);

    try {
      await db.execute(
        'REPLACE INTO discord_verification (discord_id, code, verified) VALUES (?, ?, 0)',
        [message.author.id, code]
      );

      await message.author.send({
        embeds: [new EmbedBuilder()
          .setTitle('🔐 Verification Code')
          .setDescription(`Your verification code is: \`${code}\`\nUse this in-game: \`/verify ${code}\``)
          .setColor(0x00B0F4)]
      });

      await message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('📬 I’ve sent your verification code in your DMs!')
          .setColor(0x00B0F4)]
      });

    } catch (err) {
      console.error(err);
      await message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ I couldn’t DM you. Please make sure your DMs are open and try again.')
          .setColor(0xFF0000)]
      });
    }
  }

  if (cmd === '!players') {
    try {
      const [players] = await db.execute("SELECT name, level FROM players WHERE online = 1 ORDER BY level DESC LIMIT 100");
      const list = players.map(p => `**${p.name}** (Level ${p.level})`).join('\n') || '*No players online.*';

      await message.reply({
        embeds: [new EmbedBuilder()
          .setTitle('👥 Online Players')
          .setDescription(list)
          .setFooter({ text: `Total: ${players.length}` })
          .setColor(0x00B0F4)]
      });
    } catch (err) {
      console.error(err);
      message.reply({
        embeds: [new EmbedBuilder()
          .setDescription('❌ Failed to fetch player list.')
          .setColor(0xFF0000)]
      });
    }
  }
});

// Auto verify role assigner
setInterval(async () => {
  try {
    const [rows] = await db.execute("SELECT discord_id FROM discord_verification WHERE verified = 1 LIMIT 5");
    for (const row of rows) {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const member = await guild.members.fetch(row.discord_id).catch(() => null);
      if (member) {
        await member.roles.add(process.env.ROLE_ID);
        await db.execute("UPDATE discord_verification SET verified = 2 WHERE discord_id = ?", [row.discord_id]);
      }
    }
  } catch (err) {
    console.error("Auto-role error:", err);
  }
}, 5000);

// Nickname sync + DM notify
setInterval(async () => {
  try {
    const [rows] = await db.execute("SELECT discord_id, ign FROM discord_verification WHERE verified = 1 AND notified = 0 AND ign IS NOT NULL");
    for (const row of rows) {
      const user = await client.users.fetch(row.discord_id).catch(() => null);
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const member = await guild.members.fetch(row.discord_id).catch(() => null);
      if (user && member) {
        await user.send("🎉 You're now verified and synced with your in-game name!");
        await member.setNickname(row.ign).catch((err) => {
          console.warn(`⚠️ Can't change nickname for ${row.discord_id}:`, err.message);
        });
        await member.roles.add(process.env.ROLE_ID).catch(() => {});
        await db.execute("UPDATE discord_verification SET notified = 1 WHERE discord_id = ?", [row.discord_id]);
      }
    }
  } catch (err) {
    console.error("❌ Error in verification sync:", err);
  }
}, 10000);

(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('📦 MySQL connected.');

    await client.login(process.env.BOT_TOKEN);
  } catch (err) {
    console.error('❌ Failed to connect:', err);
    process.exit(1);
  }
})();

