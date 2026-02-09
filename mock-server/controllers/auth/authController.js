const fs = require('fs');
const path = require('path');

// Load users from JSON file
const usersPath = path.join(__dirname, '../../resources/users/default.json');
let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

// Login
const login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Don't send password back to client
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    user: userWithoutPassword,
    token: `mock-token-${Date.now()}`, // Mock token for development
  });
};

// Get current user (mock - in production this would validate a token)
const getCurrentUser = (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
};

// Create user (admin only in production)
const createUser = (req, res) => {
  const { username, password, email, role } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required' });
  }
  
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    username,
    password,
    email,
    role: role || 'user',
    createdAt: Date.now(),
  };
  
  users.push(newUser);
  
  // Save to file
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword });
};

module.exports = {
  login,
  getCurrentUser,
  createUser,
};
