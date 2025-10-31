const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember]
});

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

async function updateNickname(member) {
  try {
    if (!member.manageable) return; // تأكد إن البوت يقدر يغير الاسم

    // هات الرولات اللي عند العضو بالترتيب
    const roles = member.roles.cache.sort((a, b) => b.position - a.position);
    // دور على أول رول فيه إيموجي داخل الاسم
    const topRoleWithEmoji = roles.find(r => /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(r.name));

    // الاسم الحالي بدون إيموجي لو كان محطوط قبل كده
    const cleanName = member.displayName.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]\s*/u, '');

    if (topRoleWithEmoji) {
      const emoji = topRoleWithEmoji.name.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u)?.[0];
      if (emoji && !member.displayName.startsWith(emoji)) {
        await member.setNickname(`${emoji} ${cleanName}`.slice(0, 32)); // الحد الأقصى 32 حرف
        console.log(`🟢 Updated nickname for ${member.user.tag}`);
      }
    } else {
      // مفيش رول فيه إيموجي - رجع الاسم الأصلي
      if (member.displayName !== cleanName) {
        await member.setNickname(cleanName);
        console.log(`🔵 Reset nickname for ${member.user.tag}`);
      }
    }
  } catch (err) {
    console.log(`⚠️ Error updating nickname for ${member.user.tag}:`, err.message);
  }
}

client.on('guildMemberAdd', member => updateNickname(member));
client.on('guildMemberUpdate', (oldMember, newMember) => updateNickname(newMember));

client.login(process.env.DISCORD_TOKEN);
