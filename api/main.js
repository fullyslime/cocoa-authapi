export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ allowed: false, error: "No code provided" });
  }

  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const REDIRECT_URI = `https://cocoa-authapi.vercel.app/api/main`;

  if (!CLIENT_ID || !CLIENT_SECRET || !BOT_TOKEN) {
    return res.status(500).json({ allowed: false, error: "Server not configured" });
  }

  const GUILD_ID = "1463615235674869772";
  const ROLE_ID = "1463628337418338616";

  try {
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(403).json({ allowed: false });
    }

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userRes.json();
    const userId = user.id;

    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
      {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      }
    );

    if (!memberRes.ok) {
      return res.status(403).json({ allowed: false });
    }

    const member = await memberRes.json();
    const hasRole = member.roles.includes(ROLE_ID);

    if (!hasRole) {
      return res.status(403).json({ allowed: false });
    }

    return res.status(200).json({ allowed: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ allowed: false });
  }
}
