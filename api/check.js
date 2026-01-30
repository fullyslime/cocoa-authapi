export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ allowed: false, error: "missing userId" });
  }

  const GUILD_ID = "1463615235674869772";
  const ROLE_ID = "1463628337418338616";
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

  if (!BOT_TOKEN) {
    return res.status(500).json({ allowed: false, error: "bot token not set" });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(403).json({ allowed: false });
    }

    const member = await response.json();
    const hasRole = member.roles.includes(ROLE_ID);

    if (!hasRole) {
      return res.status(403).json({ allowed: false });
    }

    return res.status(200).json({ allowed: true });
  } catch (err) {
    return res.status(500).json({ allowed: false });
  }
}
