const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store connected users with their status
const users = new Map();

// Serve a simple text response for testing
app.get('/:username/:status?', (req, res) => {
  const username = req.params.username;
  const status = parseInt(req.params.status) || 1; // Default status is 1

  // Update user status
  users.set(username, { status });

  // Broadcast the updated status to all connected clients
  io.emit('statusUpdate', { username, status });

  // Print the list of online users with their status
  printOnlineUsers();

  res.send(`${username} is online, and status is ${status}.`);
});

// WebSocket connection event
io.on('connection', (socket) => {
  const username = socket.handshake.query.username;

  // Add the user to the set of connected users with default status 1
  users.set(username, { status: 1 });

  // Print the list of online users with their status
  printOnlineUsers();

  // Handle incoming messages (optional)
  socket.on('message', (message) => {
    // Broadcast the message to all clients
    io.emit('message', { username, message });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove the user from the set of connected users
    users.delete(username);

    // Broadcast the updated list of online users with their status
    io.emit('statusUpdate', { username, status: 0 });
    printOnlineUsers();
  });
});

// Route to get the list of online users with their status
app.get('/online-users', (req, res) => {
  const onlineUsersWithStatus = Array.from(users.entries()).map(([username, { status }]) => ({
    username,
    status,
  }));
  res.json({ onlineUsers: onlineUsersWithStatus });
});

function printOnlineUsers() {
  console.log('Online Users:', Array.from(users.keys()).join(', '));
}

// Start the server
const PORT = 8888;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
