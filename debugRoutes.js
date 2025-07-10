const fs = require('fs');

module.exports = function(app) {
  // /debug/files endpoint
  app.get('/debug/files', (req, res) => {
    const secretFilePath = '/etc/secrets/frases.json';
    const localFilePath = './frases.json';

    const debugInfo = {
      secretFileExists: fs.existsSync(secretFilePath),
      localFileExists: fs.existsSync(localFilePath),
      secretFilePath: secretFilePath,
      localFilePath: localFilePath,
      // FUN_FACTS tiedoston sisältö ei ole saatavilla tässä, joten vain tiedostojen tilaa näytetään
    };

    res.json(debugInfo);
  });

  // /debug/parse-funfacts endpoint
  app.get('/debug/parse-funfacts', (req, res) => {
    const secretFilePath = '/etc/secrets/frases.json';
    const localFilePath = './frases.json';
    let filePath;
    let debug = {};
    try {
      debug.secretFileExists = fs.existsSync(secretFilePath);
      debug.localFileExists = fs.existsSync(localFilePath);
      if (debug.secretFileExists) {
        filePath = secretFilePath;
        debug.used = 'secret';
      } else if (debug.localFileExists) {
        filePath = localFilePath;
        debug.used = 'local';
      } else {
        throw new Error('frases.json ei löytynyt kummastakaan sijainnista');
      }
      const fileContent = fs.readFileSync(filePath, 'utf8');
      debug.fileContentLength = fileContent.length;
      const parsed = JSON.parse(fileContent);
      debug.parsedLength = Array.isArray(parsed) ? parsed.length : null;
      debug.sample = Array.isArray(parsed) ? parsed.slice(0, 3) : null;
      res.json({ success: true, debug });
    } catch (error) {
      debug.error = error.message;
      res.json({ success: false, debug });
    }
  });
}; 