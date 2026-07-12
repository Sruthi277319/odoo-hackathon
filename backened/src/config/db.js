const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Seeding demo workspace users...');
      
      const demoUsers = [
        {
          name: 'Alex Mercer',
          email: 'manager@transitops.com',
          password: 'password123',
          role: 'Fleet Manager',
        },
        {
          name: 'Sarah Connor',
          email: 'dispatcher@transitops.com',
          password: 'password123',
          role: 'Dispatcher',
        },
        {
          name: 'David Lightman',
          email: 'safety@transitops.com',
          password: 'password123',
          role: 'Safety Officer',
        },
        {
          name: 'Elena Rostova',
          email: 'finance@transitops.com',
          password: 'password123',
          role: 'Financial Analyst',
        },
      ];

      // Note: User.create triggers the Mongoose pre-save hook to hash these passwords
      await User.create(demoUsers);
      console.log('Demo users seeded successfully! Check Login page for credentials.');
    }
  } catch (err) {
    console.error(`User seeding failed: ${err.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed demo workspace users automatically
    await seedUsers();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
