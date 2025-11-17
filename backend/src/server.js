const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 4000;
const serverUrl = process.env.SERVER_URL;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Automatic health ping every 4 minutes
if (serverUrl) {
  setInterval(async () => {
    try {
      await fetch(`${serverUrl}/health`);
      console.log("🔄 Server pinged /health");
    } catch (err) {
      console.log("❌ Failed to ping /health:", err.message);
    }
  }, 4 * 60 * 1000); // every 4 minutes
}
