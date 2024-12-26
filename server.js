/************************************************************
 * File: server.js
 * To run:
 *    1. npm install express socket.io
 *    2. node server.js
 ************************************************************/
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.css') {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve index.html directly (we'll place index.html
// in the same directory as server.js for simplicity)
app.use(express.static(path.join(__dirname, '.')));

// Keep track of all lines drawn so that a new user
// will immediately see the existing drawing.
let lines = [];

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send existing lines to the newly connected user
  socket.emit('init', lines);

  // Whenever we receive a new line from a client, store it and broadcast
  socket.on('drawLine', (data) => {
    lines.push(data);
    // Send new line to all other connected clients
    socket.broadcast.emit('drawLine', data);
  });

  // When someone clears the board, reset lines and broadcast
  socket.on('clearCanvas', () => {
    lines = [];
    io.emit('clearCanvas');
  });

  // When user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
