# rrowauth
authentication API for rrow

*this api relies heavily on vercel

env variables:
```
DISCORD_BOT_TOKEN = your bot token
DISCORD_CLIENT_ID = your client id
DISCORD_CLIENT_SECRET = your client secret
```

flow:
oauth --> give code --> user enters code on wherever they're prompted to if permitted --> access app
note: if not permitted, no code is given.
