require('dotenv').config();

const app = require('./src/app');
const { ensureSeedAdmin } = require('./src/db');

const PORT = process.env.PORT || 3000;

(async () => {
  await ensureSeedAdmin();
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
})();
