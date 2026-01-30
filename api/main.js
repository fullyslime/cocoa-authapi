return res.json({
  clientId: process.env.DISCORD_CLIENT_ID || null,
  clientSecret: process.env.DISCORD_CLIENT_SECRET ? "set" : null,
  botToken: process.env.DISCORD_BOT_TOKEN ? "set" : null,
});
