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
DISCORD_TOKEN=super_secret_discord_token
OWNERS=your_id
PREFIX=whatever_u_want

# Default lavalink config
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWD=youshallnotpass
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
