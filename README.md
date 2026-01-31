# rrowauth
authentication API for rrow
*this api relies heavily on vercel

env variables:
```
DISCORD_BOT_TOKEN = your bot token
DISCORD_CLIENT_ID = your client id
DISCORD_CLIENT_SECRET = your client secret
```

usage:

```
https://yourdomain.lol/api/user?USERID=USER_ID_TO_CHECK
```

uses the bot inside of the discord server to check if the user ID has a 
specific role then returns a access denial/granted message.

pleasenote that /api/main is a custom 0auth function for rrowclient.
