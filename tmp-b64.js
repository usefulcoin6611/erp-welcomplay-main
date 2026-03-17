const fs = require('fs');
const b64 = fs.readFileSync('public/auth-hero.png').toString('base64');
const content = `export const authHeroBase64 = "data:image/png;base64,${b64}";\n`;
fs.writeFileSync('src/components/auth-hero-base64.ts', content);
