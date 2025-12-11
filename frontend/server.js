const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Points to React build folder
const buildPath = path.join(__dirname, 'build');

// Serve static assets
app.use(express.static(buildPath));


app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.join(buildPath, 'service-worker.js'), {
    headers: {
      "Cache-Control": "no-cache"
    }
  });
});


app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(buildPath, 'manifest.json'));
});

app.get('/asset-manifest.json', (req, res) => {
  res.sendFile(path.join(buildPath, 'asset-manifest.json'));
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Listen on Fly-provided port + 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend listening on http://0.0.0.0:${PORT}`);
});