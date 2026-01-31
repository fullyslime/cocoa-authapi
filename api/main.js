// rrow-authapi
// main.js
// checks the validity of a userid that gets passed through oauth

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("no code provided");

    const {
      DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET,
      DISCORD_BOT_TOKEN
    } = process.env;

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_BOT_TOKEN) {
      return res.status(500).send("internal server error");
    }

    const REDIRECT_URI = "https://rrowauth.vercel.app/api/main";

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

    if (!tokenRes.ok) return res.status(403).send("you are not permitted access to rrow right now.");

    const { access_token } = await tokenRes.json();
    if (!access_token) return res.status(403).send("you are not permitted access to rrow right now.");

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userRes.ok) return res.status(403).send("you are not permitted access to rrow right now.");
    const user = await userRes.json();

    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/1463615235674869772/members/${user.id}`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );

    if (!memberRes.ok) return res.status(403).send("you are not permitted access to rrow right now.");

    const member = await memberRes.json();
    const hasRole = member.roles.includes("1463628337418338616");

    return hasRole
      ? res.status(200).send("your security access code is: " + code + ".\nEnter this code where you are currently prompted to.\nnote: this code is not permanent, each time you login, a new one is generated.");
      : res.status(403).send("you are not permitted access to rrow right now.");

  } catch (err) {
    console.error("API CRASH:", err);
    return res.status(500).send("internal server error");
  }
}
