const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In-memory chat history
let messageHistory = [];

// WebSocket setup
wss.on('connection', (ws) => {
  // Send chat history on new connection
  ws.send(JSON.stringify({ type: 'history', data: messageHistory }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'message') {
      const newMessage = {
        user: data.user,
        text: data.text,
        timestamp: new Date().toISOString()
      };

      messageHistory.push(newMessage);

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', data: newMessage }));
        }
      });
    }
  });
});

// ✅ Serve static files from React frontend build
app.use(express.static(path.join(__dirname, 'client', 'build')));

// ✅ Catch-all: serve React index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

