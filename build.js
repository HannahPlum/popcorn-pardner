// Generates config.js from environment variables at build time.
// Run automatically by Vercel before deployment.
const fs = require('fs');

const config = `const CONFIG = {
  TMDB_API_KEY: ${JSON.stringify(process.env.TMDB_API_KEY || '')},
  TMDB_READ_TOKEN: ${JSON.stringify(process.env.TMDB_READ_TOKEN || '')}
};
`;

fs.writeFileSync('config.js', config);
console.log('config.js generated from environment variables.');
