const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, '..', 'src', 'environments');

const content = `export const environment = {
  production: true,
  rawgApiKey: '${process.env.RAWG_API_KEY}',
  groqApiKey: '${process.env.GROQ_API_KEY}',
  groqApiUrl: '${process.env.GROQ_API_URL}',
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.FIREBASE_APP_ID}'
  }
};
`;

fs.mkdirSync(envDir, { recursive: true });
fs.writeFileSync(path.join(envDir, 'environment.ts'), content);
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), content);
console.log('Environment files generated.');
