// cocoa-authapi
// user.js
// checks the validity of a specific userid.
// USAGE: https://rrowauth.vercel.app/api/user?USERID=user_to_check

export default async function handler(req, res) {
  try {
    const userId = req.query.USERID;
    if (!userId) return res.status(400).send("enter the user's ID you wish to check.");

    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    if (!BOT_TOKEN) return res.status(500).send("server isn't configured.");

    const GUILD_ID = "1463615235674869772";
    const ROLE_ID = "1463628337418338616";

    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    );

    if (!tokenRes.ok) return res.status(403).send("rrow access denied");

    const member = await memberRes.json();
    const hasRole = member.roles.includes(ROLE_ID);

    if (hasRole) return res.status(200).send("rrow access granted");
    else return return res.status(403).send("rrow access denied");

  } catch (err) {
    console.error("API CRASH:", err);
    return res.status(500).send("internal server error");
  }
}
