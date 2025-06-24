const tmi = require('tmi.js');
const express = require('express');
require('dotenv').config();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const CHANNEL = (process.env.TWITCH_CHANNEL || '').toLowerCase();
const BOT_USERNAME = process.env.BOT_USERNAME;
const TMI_OAUTH_TOKEN = process.env.TMI_OAUTH_TOKEN;

const activeUsers = new Map(); // { username: timestamp }

if (!CHANNEL || !BOT_USERNAME || !TMI_OAUTH_TOKEN) {
  console.error("Twitch-kanavan, botin käyttäjätunnuksen ja TMI OAuth-tokenin tulee olla määriteltynä ympäristömuuttujissa.");
  process.exit(1);
}

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
let FUN_FACTS = [];
try {
  FUN_FACTS = JSON.parse(fs.readFileSync('./frases.json', 'utf8'));
  console.log('Yhteensä lauseita:', FUN_FACTS.length);
} catch (error) {
  console.error('Virhe frases.json lataamisessa:', error);
  FUN_FACTS = ['Oletusviesti: Salaisuus on harjoittelu!'];
}


console.log('Ensimmäinen lause:', FUN_FACTS[0]);
console.log('Viimeinen lause:', FUN_FACTS[FUN_FACTS.length - 1]);
console.log('Yhteensä lauseita:', FUN_FACTS.length);



app.get('/winner', (req, res) => {
  const users = [...activeUsers.keys()];
  if (users.length === 0) {
    return res.send("Ei aktiivisia käyttäjiä.");
  }

  const randomUser = users[Math.floor(Math.random() * users.length)];
  const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

  const message = `TERVETULOA paskimman katsojan SM-kisoihin! Tänää on ollu erittäin hyvä kuhina ja taso on jälleen napsua korkeempi mitä viimeksi. Katsotaan voittaja... Voittaja on: ${randomUser}.  Kysyn teiltä mikä on voittonne salaisuus?  ${randomFact}    Jaaha, takaisin yläkertaan.`;



  res.send(message);
});

app.listen(PORT, () => {
  console.log(`Serveri kuuntelee portissa ${PORT}`);
});
