# 🏆 ViewerListener

Twitch-botti, joka seuraa chat-aktiivisuutta ja arpoo voittajia **"paskimman katsojan SM-kisoihin"** hauskoilla selityksillä.

---

## 🎯 Ominaisuudet

- Seuraa aktiivisia käyttäjiä Twitch-kanavassa
- Arpoo satunnaisen voittajan aktiivisista käyttäjistä
- Antaa hauskan "voiton salaisuuden" `frases.json`-tiedostosta
- Poistaa passiiviset käyttäjät (30 min timeout)
- Muokattavat fraasit erillisessä tiedostossa
- RESTful API
- Optimoitu Render.com-hostaukseen

---

## ⚙️ Teknologiat

- **Node.js** – Runtime
- **Express.js** – Web server
- **tmi.js** – Twitch chat client
- **dotenv** – Environment variable management

---

## 🚀 Asennus

### 1. Kloonaa repository

```bash
git clone https://github.com/F0rsu/ViewerListener.git
cd ViewerListener
npm install
```

### 2. Luo `.env`-tiedosto

```env
BOT_USERNAME=your_twitch_bot_username
TMI_OAUTH_TOKEN=oauth:your_twitch_oauth_token
TWITCH_CHANNEL=your_channel_name
PORT=3000
```

### 3. Luo `frases.json`-tiedosto

```json
[
  "Oon pelannut tätä peliä syntymästä asti.",
  "Mun salaisuus on raaka muna ja chilikastike.",
  "Nukuin viime yön autotallissa jotta tuuri kääntyisi.",
  "Salaisuus on yksinkertainen: En koskaan häviä.",
  "Vedän aina ennen matsia 500 punnerrusta.",
  "Käytän aina samaa alushousua, se tuo onnea."
]
```

### 4. Hanki Twitch OAuth Token

Twitch API:n kanssa kommunikointiin tarvitset OAuth-tokenin. Tokenin hankkimiseen on useita reittejä käyttötarkoituksesta riippuen.

#### A. Tokenin hankkiminen kolmannen osapuolen sivuston kautta

Tämä on nopein tapa hankkia käyttäjätoken tiettyjä tarkoituksia varten, kuten chattiin liittymiseen.
* Mene esimerkiksi: i [https://twitchtokengenerator.com/](https://twitchtokengenerator.com/)
* Kirjaudu sisään Twitch-tililläsi.
* Kopioi token (muotoa `oauth:...`). Tämä on käyttäjätoken tietyillä scoppeilla.

#### B. Twitch API:n Client Credentials Flow (Sovelluskohtainen token) 

Tätä käytetään, kun sovelluksesi tarvitsee pääsyn julkisiin tietoihin ilman käyttäjän kirjautumista
* **Käyttötarkoitus:** Sovelluskohtainen autentikointi (ei käyttäjää mukana)
* **Hyöty:** Saa "app access token" -tokenin.
* **Rajoitukset:** Pääsee käsiksi vain julkiseen dataan. Ei vaadi käyttäjäoikeuksia/scopeja Hyvä esimerkiksi pelitietojen tai julkisten käyttäjäprofiilien hakemiseen.

* **Prosessi:** Yhden API-kutsun prosessi.
  ```bash
    curl -X POST 'https://id.twitch.tv/oauth2/token' \
        -d client_id=YOUR_CLIENT_ID \
        -d client_secret=YOUR_CLIENT_SECRET \
        -d grant_type=client_credentials
    ```
   

  ```Powershell

    Invoke-RestMethod -Uri 'https://id.twitch.tv/oauth2/token' `
    -Method POST `
    -Body @{
        client_id = 'YOUR_CLIENT_ID'
        client_secret = 'YOUR_CLIENT_SECRET'
        grant_type = 'client_credentials'
       }
 *Huom:* Korvaa `YOUR_CLIENT_ID` ja `YOUR_CLIENT_SECRET` omilla Twitch-sovelluksesi tunnuksilla.





### 5. Käynnistä lokaalisti

```bash
npm start
```

---

## ☁️ Deployment (Render.com)

### 1. Valmistele repository

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Luo Web Service Render.comissa

- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. Aseta ympäristömuuttujat (Environment Variables)

```env
BOT_USERNAME=your_bot_username
TMI_OAUTH_TOKEN=oauth:your_oauth_token
TWITCH_CHANNEL=your_channel_name

```

📁 **HUOM!** Varmista, että `frases.json` on mukana repositoryssä tai erikseen renderin secret filesissa

---

## 📡 API Endpointit

### `GET /winner`

Arpoo voittajan kaikista aktiivisista käyttäjistä.

**Response:**

```
TERVETULOA paskimman katsojan SM-kisoihin! Tänää on ollu erittäin hyvä kuhina ja taso on jälleen napsua korkeempi mitä viimeksi. Katsotaan voittaja... Voittaja on: username123. Kysyn teiltä mikä on voittonne salaisuus? Salaisuus on yksinkertainen: En koskaan häviä. Jaaha, takaisin yläkertaan.
```

---

## 📝 Fraasien hallinta

### `frases.json` rakenne

```json
[
  "Ensimmäinen hauska fraasi",
  "Toinen hauska fraasi",
  "Kolmas hauska fraasi"
]
```

### Lisääminen:

- Muokkaa `frases.json`
- Commit ja push muutokset
- Render deployaa automaattisesti uuden version
- Botti lataa fraasit uudelleen käynnistyessään

---

## 🤖 Nightbot-integraatio

### Komento

- **Command:** `!winner`
- **Message:**  
  ```text
  $(urlfetch https://your-render-url.onrender.com/winner)
  ```

### Suositellut asetukset

- **Userlevel:** Moderator tai VIP  
- **Cooldown:** 30 sekuntia  
- **Alias:** Ei tarvita  

---

## 🧠 Toimintalogiikka

### Aktiivisuuden seuranta

- Botti kuuntelee kaikkia chat-viestejä
- Jokainen viesti päivittää käyttäjän viimeksi aktiivisen ajan
- Käyttäjä poistetaan 30 min inaktiivisuuden jälkeen

### Voittajan valinta

- Haetaan aktiiviset käyttäjät
- Valitaan satunnainen käyttäjä
- Valitaan satunnainen fraasi
- Muodostetaan vastausviesti

### Fraasien lataus

- Ladataan `frases.json` käynnistyessä
- Jos puuttuu → käytetään oletusfraasia
- Botti logittaa fraasien määrän ja esimerkit

---

## 💡 Hauskoja esimerkkifraaseja

```text
"Oon pelannut tätä peliä syntymästä asti."
"Vedän aina ennen matsia 500 punnerrusta."
"Käytän aina samaa alushousua, se tuo onnea."
"Salaisuus on yksinkertainen: En koskaan häviä."
```

---

## 💤 Render.com Erityispiirteet

### Nukkuminen

- Render (ilmainen) menee uneen 15 min inaktiivisuuden jälkeen
- Twitch-yhteys katkeaa nukkumisen aikana
- Ensimmäinen pyyntö voi kestää ~30 sek

### Ratkaisut

- Käytä UptimeRobot tai vastaavaa
- Päivitä maksulliseen Render-tiliin
- Tai hyväksy että käyttäjiä "unohtuu"

---

## 🚧 Kehitysideoita

- Keep-alive ping
- Käyttäjäkohtaiset cooldownit
- Kanavakohtaiset fraasilistat
- Voittajahistoria
- Painotettu arvonta (aktiivisuuden mukaan)
- Web-käyttöliittymä fraasien hallintaan
- Chat-komento fraasien lisäykseen
- Discord-integraatio

---

## 🛠️ Vianmääritys

### ❌ "Ei aktiivisia käyttäjiä"

- Tarkista että botti on yhdistetty oikeaan kanavaan
- Varmista että chatissa on viestejä viimeisen 30 min aikana
- Katso Renderin logit

### ❌ Fraasit eivät lataudu

- Tarkista että `frases.json` on repositoryn juuressa
- Tarkista JSON-syntaksi: [https://jsonlint.com/](https://jsonlint.com/)
- Katso botin logit Renderistä

### ❌ Nightbot ei vastaa

- Tarkista että URL on oikein
- Varmista että Nightbot on kanavallasi aktiivinen (`!nightbot`)
- Render herää ~30 sek ensimmäisestä pyynnöstä

### ❌ OAuth-ongelmat

- Tokenin tulee alkaa `oauth:`-etuliitteellä
- Luo uusi token, jos vanha ei toimi
- Tarkista että botti-tili on olemassa

---

## 📄 Lisenssi

[MIT License](LICENSE) – käytä vapaasti omiin projekteihin!

---

## ❤️ Tuki

Jos törmäät ongelmiin:

- Tarkista Render.com logit
- Testaa API-pyynnöt selaimessa
- Varmista `.env`-muuttujat


## 😎 Loppusanat

Projekti on omaksi huviksi tehty eikä tietenkään mihinkään oikeaan tarpeeseen, mutta ajattelin tehdä jonkinlaisen dokumentaation harjoittelun vuoksi.



