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
  "Mun salaisuus on raaka muna ja chilikastike.",
  "Käytän aina samaa alushousua, se tuo onnea.",
  "Likaiset kollarit.",
  "Vedän aina ennen matsia 500 punnerrusta.",
  "Mä oon kato datanomi.",
  "Oon treenannut joka päivä vuodesta 1999 asti.",
  "Vuosihaasteen psyykkiset ongelmat tekivät minusta vahvemman.",
  "Penispumppu on mun paras kaveri.",
  "Pippelin koko on tärkeämpi kuin taito."
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
