import express from 'express';
import bcrypt from 'bcryptjs';
import * as db from '../models/dbAdapter.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password and name are required.' });
    }

    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.createUser({
      username,
      password: hashedPassword,
      role: role || 'operator',
      name
    });

    // Create token
    const token = generateToken({ id: newUser._id, role: newUser.role, username: newUser.username });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken({ id: user._id, role: user.role, username: user.username });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
