// cocoa-authapi
// main.js
// checks the validity of a userid that gets passed through 0auth

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("No code provided.");

    const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN } = process.env;

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_BOT_TOKEN) {
      return res.status(500).send("Internal server error.");
    }

    const REDIRECT_URI = "https://cocoa-authapi.vercel.app/api/main";

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

    if (!tokenRes.ok) return res.status(403).send("cocoa access denied");

    const { access_token } = await tokenRes.json();
    if (!access_token) return res.status(403).send("cocoa access denied");

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!tokenRes.ok) return res.status(403).send("cocoa access denied");

    const user = await userRes.json();

    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/1463615235674869772/members/${user.id}`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );
    
    if (!tokenRes.ok) return res.status(403).send("cocoa access denied");

    const member = await memberRes.json();

    const hasRole = member.roles.includes("1463628337418338616");

    if (hasRole) {
      return res.status(200).send("cocoa access granted.");
    } else {
      return res.status(403).send("cocoa access denied");
    }

  } catch (err) {
    console.error("API CRASH:", err);
    return res.status(500).send("internal server error");
  }
}
