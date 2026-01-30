export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ allowed: false });

    const {
      DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET,
      DISCORD_BOT_TOKEN
    } = process.env;

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_BOT_TOKEN) {
      return res.status(500).json({ allowed: false, error: "env missing" });
    }

    const REDIRECT_URI = "https://cocoa-authapi.vercel.app/api/check";

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return res.status(403).json({ allowed: false, tokenError: text });
    }

    const { access_token } = await tokenRes.json();
    if (!access_token) return res.status(403).json({ allowed: false });

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userRes.ok) return res.status(403).json({ allowed: false });

    const user = await userRes.json();

    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/1463615235674869772/members/${user.id}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
      }
    );

    if (!memberRes.ok) return res.status(403).json({ allowed: false });

    const member = await memberRes.json();

    return res.json({
      allowed: member.roles.includes("1463628337418338616")
    });

  } catch (err) {
    console.error("CRASH:", err);
    return res.status(500).json({ allowed: false });
  }
}
