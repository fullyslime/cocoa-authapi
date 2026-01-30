export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ allowed: false, error: "No code provided" });

    const {
      DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET,
      DISCORD_BOT_TOKEN
    } = process.env;

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_BOT_TOKEN) {
      return res.status(500).json({ allowed: false, error: "Server not configured" });
    }

    // ⚠️ must exactly match the redirect URI registered in Discord
    const REDIRECT_URI = "https://cocoa-authapi.vercel.app/api/main";

    // 1️⃣ exchange code for access token
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

    // 2️⃣ fetch user info
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userRes.ok) return res.status(403).json({ allowed: false });

    const user = await userRes.json();

    // 3️⃣ fetch guild member using bot token
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/1463615235674869772/members/${user.id}`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );

    if (!memberRes.ok) return res.status(403).json({ allowed: false });

    const member = await memberRes.json();

    // 4️⃣ check role
    const hasRole = member.roles.includes("1463628337418338616");

    return res.status(200).json({ allowed: hasRole });

  } catch (err) {
    console.error("API CRASH:", err);
    return res.status(500).json({ allowed: false });
  }
}
