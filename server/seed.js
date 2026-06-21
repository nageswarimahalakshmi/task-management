require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Clear existing tasks and demo user
    await Task.deleteMany({});
    await User.deleteMany({ email: 'demo@zentask.com' });
    console.log('Cleaned up previous demo records.');

    // Create demo user
    const demoUser = await User.create({
      username: 'Alex Carter',
      email: 'demo@zentask.com',
      password: 'password123' // Will be auto-hashed by pre-save hook
    });
    console.log('Created demo user: demo@zentask.com (password: password123)');

    // Date calculations
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);

    // Tasks list
    const tasks = [
      {
        title: 'Fix critical mobile login crash',
        description: 'Investigate JWT token decryption crash on iOS Safari browser environments.',
        status: 'Todo',
        priority: 'High',
        category: 'Urgent',
        dueDate: today,
        user: demoUser._id
      },
      {
        title: 'Design glassmorphic UI landing page',
        description: 'Create Figma design system using obsidian shades, vibrant neon violet highlights, and glass properties.',
        status: 'Todo',
        priority: 'High',
        category: 'Work',
        dueDate: tomorrow,
        user: demoUser._id
      },
      {
        title: 'Review team performance reports',
        description: 'Aggregate quarterly progress charts and summarize milestones for management presentation.',
        status: 'In Progress',
        priority: 'Medium',
        category: 'Work',
        dueDate: inTwoDays,
        user: demoUser._id
      },
      {
        title: 'Buy fresh groceries',
        description: 'Eggs, Avocados, Almond milk, Coffee beans, Spinach, Salmon.',
        status: 'Todo',
        priority: 'Low',
        category: 'Shopping',
        dueDate: tomorrow,
        user: demoUser._id
      },
      {
        title: 'Pay monthly utility bills',
        description: 'Process internet, water, and electric bills. Auto-pay needs manual update.',
        status: 'Completed',
        priority: 'High',
        category: 'Finance',
        dueDate: threeDaysAgo,
        user: demoUser._id
      },
      {
        title: 'Morning cardio running routine',
        description: '45-minute jog around central park, stretching, and hydration check.',
        status: 'Completed',
        priority: 'Low',
        category: 'Health',
        dueDate: yesterday,
        user: demoUser._id
      },
      {
        title: 'Pick up anniversary gift',
        description: 'Collect custom engraved watch from jewellery workshop.',
        status: 'In Progress',
        priority: 'Medium',
        category: 'Personal',
        dueDate: today,
        user: demoUser._id
      }
    ];

    await Task.insertMany(tasks);
    console.log(`Successfully seeded ${tasks.length} tasks!`);
    
    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
