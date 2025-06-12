const tmi = require('tmi.js');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const CHANNEL = (process.env.TWITCH_CHANNEL || '').toLowerCase();
const BOT_USERNAME = process.env.BOT_USERNAME;
const TMI_OAUTH_TOKEN = process.env.TMI_OAUTH_TOKEN;

const activeUsers = new Map(); // { username: timestamp }

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: TMI_OAUTH_TOKEN
  },
  channels: [ CHANNEL ]
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
  if (self) return;
  const username = tags.username.toLowerCase();
  activeUsers.set(username, Date.now());
});

// Poista passiiviset käyttäjät 30 min jälkeen
setInterval(() => {
  const now = Date.now();
  const THIRTY_MINUTES = 30 * 60 * 1000;

  for (const [username, lastActive] of activeUsers.entries()) {
    if (now - lastActive > THIRTY_MINUTES) {
      activeUsers.delete(username);
    }
  }

  console.log("Aktiiviset käyttäjät:", [...activeUsers.keys()]);
}, 60 * 1000);

// Faktoja tai juttuja voittajille
const FUN_FACTS = [
    "Oon pelannut tätä peliä syntymästä asti.",
    "Pillunsyönti",
    "Mun salaisuus on raaka muna ja chilikastike.",
    "Nukuin viime yön autotallissa jotta tuuri kääntyisi.",
    "Oon kattonut kaikki streamit VHS:llä taaksepäin.",
    "Salaisuus on yksinkertainen: En koskaan häviä.",
    "Joka kerta kun kaadun, nousen kaksi kertaa vahvempana.",
    "Mun taidot tulee huoltomiehen pumpunkorjauskirjasta.",
    "Vedän aina ennen matsia 500 punnerrusta.",
    "Käytän aina samaa alushousua, se tuo onnea.",
    "Oon voittanut paskimman katsojan SM-kisat kolme kertaa putkeen.",
    "Likaiset kollarit",
    "Kusettaminen",
    "Finnrunss jallut",
    "Presidentin juominen",
    "Metsämiljoonilla kaiken riggaaminen",
    "!sr https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "Oon oppinut elämään sekä voittamaan ilman pyörätuolia",
    "Oon treenannut joka päivä vuodesta 1999 asti.",
    "Penispumppu on mun paras kaveri.",
    "Eteen ottaa aina, kun joku sanoo että en voi tehdä jotain.",
    "Vuosihaasteen aiheuttamat psyykkiset ongelmat ovat tehneet minusta vahvemman.",
    "Auf der Heide blüht ein kleines Blümelein.",
    "Narkinsonin vihreä rauhoittaja",
    "Krooninen valehtelu a la metsämiljonääri",
    "Mallon varvas siellä mihi se ei kuulu",
    "Jatkuva GAMBA",
    "Pippelin koko on tärkeämpi kuin taito",
    "Mä oon kato datanomi",
    "Jatkuvat Erika-harhat"
];

app.get('/winner', (req, res) => {
  const users = [...activeUsers.keys()];
  if (users.length === 0) {
    return res.send("Ei aktiivisia käyttäjiä.");
  }

  const randomUser = users[Math.floor(Math.random() * users.length)];
  const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

  const message = `TERVETULOA paskimman katsojan SM-kisoihin! Tänää on ollu erittäin hyvä kuhina. Voittaja on: ${randomUser}. Mikä on voittonne salaisuus? ${randomFact} Jaaha, takaisin yläkertaan.`;

  res.send(message);
});

app.listen(PORT, () => {
  console.log(`Serveri kuuntelee portissa ${PORT}`);
});
