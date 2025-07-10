const tmi = require('tmi.js');
const express = require('express');
require('dotenv').config();
const fs = require('fs');
const path = require('path'); 

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));



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
  // Yritä ensin lukea Renderin secret filesin sijaintia; jos ei löydy, lue lokaalia polkua  
  const secretFilePath = '/etc/secrets/frases.json';
  const localFilePath = './frases.json';
  
  console.log('Tarkistetaan tiedostojen olemassaolo...');
  console.log('Secret file path:', secretFilePath, 'exists:', fs.existsSync(secretFilePath));
  console.log('Local file path:', localFilePath, 'exists:', fs.existsSync(localFilePath));
  
  let filePath;
  if (fs.existsSync(secretFilePath)) {
    filePath = secretFilePath;
    console.log('Ladataan frases.json Renderin secret files -kansiosta');
  } else if (fs.existsSync(localFilePath)) {
    filePath = localFilePath;
    console.log('Ladataan frases.json paikallisesta tiedostosta');
  } else {
    console.error('Molemmat tiedostopolut eivät löydy:');
    console.error('- Secret file:', secretFilePath);
    console.error('- Local file:', localFilePath);
    throw new Error('frases.json ei löytynyt mistään sijainnista');
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  console.log('Tiedosto luettu, sisältö pituus:', fileContent.length, 'merkkiä');
  
  FUN_FACTS = JSON.parse(fileContent);
  console.log('Yhteensä lauseita:', FUN_FACTS.length);
} catch (error) {
  console.error('Virhe frases.json lataamisessa:', error.message);
  console.error('Täydellinen virhe:', error);
  FUN_FACTS = ['Oletusviesti: Salaisuus on harjoittelu!'];
}


console.log('Ensimmäinen lause:', FUN_FACTS[0]);
console.log('Viimeinen lause:', FUN_FACTS[FUN_FACTS.length - 1]);




app.get('/winner', (req, res) => {
  const users = [...activeUsers.keys()];
  if (users.length === 0) {
    return res.send("Ei aktiivisia käyttäjiä.");
  }

  const randomUser = users[Math.floor(Math.random() * users.length)];
  const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

  const message = `TERVETULOA paskimman katsojan SM-kisoihin! Tänään on ollu erittäin hyvä kuhina ja taso on jälleen napsua korkeempi mitä viimeksi. Katsotaan voittaja... Voittaja on: ${randomUser}.  Kysyn teiltä mikä on voittonne salaisuus?  ${randomFact}    Jaaha, takaisin yläkertaan.`;

  res.send(message);
});

// Rekisteröi debugRoutes.js tiedoston reitit
require('./debugRoutes')(app);

app.listen(PORT, () => {
  console.log(`Serveri kuuntelee portissa ${PORT}`);
});
