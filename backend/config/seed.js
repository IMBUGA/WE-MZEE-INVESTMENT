const mongoose = require('mongoose');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/we_mzee');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Member.deleteMany({});
    console.log('Cleared existing members...');

    // Create admin member
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminMember = new Member({
      name: 'Admin User',
      email: 'admin@wemzee.com',
      password: adminPassword,
      idNumber: '12345678',
      phone: '+254700000000',
      role: 'admin',
      nextOfKin: {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+254711111111'
      },
      status: 'active',
      totalContributions: 50000,
      totalProfits: 15000
    });

    // Create treasurer member
    const treasurerPassword = await bcrypt.hash('treasurer123', 12);
    const treasurerMember = new Member({
      name: 'Treasurer User',
      email: 'treasurer@wemzee.com',
      password: treasurerPassword,
      idNumber: '87654321',
      phone: '+254722222222',
      role: 'treasurer',
      nextOfKin: {
        name: 'John Smith',
        relationship: 'sibling',
        phone: '+254733333333'
      },
      status: 'active',
      totalContributions: 45000,
      totalProfits: 12000
    });

    // Create regular members
    const memberPassword = await bcrypt.hash('member123', 12);
    const regularMembers = [
      {
        name: 'John Doe',
        email: 'john@wemzee.com',
        password: memberPassword,
        idNumber: '11223344',
        phone: '+254744444444',
        role: 'member',
        nextOfKin: {
          name: 'Mary Doe',
          relationship: 'spouse',
          phone: '+254755555555'
        },
        status: 'active',
        totalContributions: 30000,
        totalProfits: 8000
      },
      {
        name: 'Jane Smith',
        email: 'jane@wemzee.com',
        password: memberPassword,
        idNumber: '55667788',
        phone: '+254766666666',
        role: 'member',
        nextOfKin: {
          name: 'Bob Smith',
          relationship: 'spouse',
          phone: '+254777777777'
        },
        status: 'active',
        totalContributions: 35000,
        totalProfits: 9000
      }
    ];

    await adminMember.save();
    await treasurerMember.save();
    await Member.insertMany(regularMembers);

    console.log('Database seeded successfully!');
    console.log('Admin credentials: admin@wemzee.com / admin123');
    console.log('Treasurer credentials: treasurer@wemzee.com / treasurer123');
    console.log('Member credentials: john@wemzee.com / member123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();