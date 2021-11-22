# Lavalink Music Bot

I made this bot because, well, groovy was taken down, so I made my own clone.

It's written in TypeScript and [Discord.js V13](), uses [Lavalink](https://github.com/freyacodes/Lavalink) for stable audio playback and [erela.js](https://github.com/MenuDocs/erela.js) as It's wrapper, it also uses the [Sapphire Framework for Discord bots](https://github.com/sapphiredev/framework/).

## Requirements

1. Node.js 16.1.x
2. Java version 13 or higher (For Lavalink).
3. Lavalink (Get it from [here](https://github.com/freyacodes/Lavalink/releases))
4. Spotify API Client ID, and Client Secret. (Get the from [here](https://developer.spotify.com/dashboard/applications))
5. A Discord bot token

## Self-hosting guide

This bot is pretty easy to set up, here's the guide:

1. Clone this repo:

```
git clone https://github.com/iliveinsideyourwalls/lavalink-music-bot.git
```

2. cd into de directory.
3. Install dependencies:

```
npm install
```

4. Change the name of the `src/.env.example` file to `.env`.

5. Populate your .env file:

```
# Bot essentials
DISCORD_TOKEN=<Bot token>
OWNERS=<Your Discord ID>
PREFIX=<Some prefix>

# Default lavalink cradentials
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWD=youshallnotpass

# For spotify support
SPOTIFY_CLIENT_ID=<Your app-s client id>
SPOTIFY_CLIENT_SECRET=<Your app's client secret>

# You can put whatever in these
CLIENT_NAME=<Some name>
CLIENT_VERSION=<Some version>

# The default player's volume
DEFAULT_VOLUME=<Some value (I do not recommend more than 15)>
```

6. Now you have to set-up a Lavalink node, Get lavalink from [here](https://github.com/freyacodes/Lavalink/releases).

7. Make a folder called `lavalink_server` wherever you want (I recommend that you put it in the same folder as where you cloned the repo)

8. Put the Lavalink executable in the folder you just made along with a [application.yml](https://github.com/freyacodes/Lavalink/blob/master/LavalinkServer/application.yml.example) file.

9. Run lavalink (Note that you **must** run the command in the same folder as the application.yml file):

```
java -jar <path/to/lavalink>/Lavalink.jar
```

10. Now build the bot:

```
npm run build
```

11. Run the bot:

```
node dist/index.js
```

If you see something like [this](https://i.imgur.com/1ewTEM5.png) then the bot is ready to go, now all there's left is inviting your bot to your server.
