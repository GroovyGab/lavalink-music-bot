# Lavalink music bot

ALRIGHT

sorry, i pretty much dumped this BUT I'M BACK BABAY

the bot isn't ready but is somewhat usable

guide:

clone the repo (or download it):

```
git clone https://github.com/GaboTheCoder/lavalink-music-bot.git
```

node v16.1.x or higher is required

install dependencies:

```
npm install
```

get lavalink from [here](https://github.com/freyacodes/Lavalink/releases) (java version 13 or higher is required)

slap the lavalink executable in a random folder along with [a application.yml file](https://github.com/freyacodes/Lavalink/blob/master/LavalinkServer/application.yml.example)

run lavalink:

```
java -jar Lavalink.jar
```

rename the `.env.example` file in `src` to `.env`

populate the `.env` file:

```
# Bot essentials
DISCORD_TOKEN=
OWNERS=
PREFIX=

# Ignore this one for now
DISCONNECT_DELAY=

# Default lavalink cradentials
LAVALINK_HOST=
LAVALINK_PORT=
LAVALINK_PASSWD=

# For spotify support
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# You can put whatever in these
CLIENT_NAME=
CLIENT_VERSION=

# The default player's volume
DEFAULT_VOLUME=
```

compile the typescript files:

```
npm run build
```

run da bot:

```
node ./dist/index.js
```

if there's any issue or you have trouble stting up the bot just open a new issue

(this is not the defenitive readme but i'm lazy soooooo for now it is what it is)
