require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');
const { protect } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins a room based on their User ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_task_manager_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// --- AUTHENTICATION ROUTES ---

// @route   POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// --- TASK CRUD ROUTES ---

// @route   GET /api/tasks
app.get('/api/tasks', protect, async (req, res) => {
  try {
    const { status, priority, category, search, sortBy, order } = req.query;
    
    // Build query object
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort parameters
    let sort = {};
    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      sort[sortBy] = sortOrder;
    } else {
      sort['createdAt'] = -1; // Default newest first
    }

    const tasks = await Task.find(query).sort(sort);
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('Fetch Tasks Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks
app.post('/api/tasks', protect, async (req, res) => {
  const { title, description, status, priority, category, dueDate } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      user: req.user._id,
    });

    // Broadcast the task event to all user connections
    io.to(req.user._id.toString()).emit('taskEvent', {
      type: 'TASK_CREATED',
      task,
      senderSocketId: req.headers['x-socket-id'] || null
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id
app.put('/api/tasks/:id', protect, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user owns task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Update fields
    const fieldsToUpdate = ['title', 'description', 'status', 'priority', 'category', 'dueDate'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    // Broadcast socket update
    io.to(req.user._id.toString()).emit('taskEvent', {
      type: 'TASK_UPDATED',
      task,
      senderSocketId: req.headers['x-socket-id'] || null
    });

    res.json({ success: true, task });
  } catch (error) {
    console.error('Update Task Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
app.delete('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user owns task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await task.deleteOne();

    // Broadcast socket delete
    io.to(req.user._id.toString()).emit('taskEvent', {
      type: 'TASK_DELETED',
      taskId: req.params.id,
      senderSocketId: req.headers['x-socket-id'] || null
    });

    res.json({ success: true, message: 'Task deleted', taskId: req.params.id });
  } catch (error) {
    console.error('Delete Task Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
