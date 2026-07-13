const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Facility = require('../models/Facility');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const facilitiesData = [
  {
    name: 'Main Library',
    building: 'Block A',
    locationDetails: 'First Floor, opposite the reading room',
    description: 'Central library containing books, references, and study areas'
  },
  {
    name: 'Chemistry Laboratory',
    building: 'Block B',
    locationDetails: 'Ground Floor, Room 105',
    description: 'Chemistry experiments and research lab'
  },
  {
    name: 'Computer Center 1',
    building: 'Block A',
    locationDetails: 'Second Floor, Room 204',
    description: 'ICT infrastructure and student computer workstation wing'
  },
  {
    name: 'Indoor Sports Hall',
    building: 'Sports Complex',
    locationDetails: 'Ground Floor entrance',
    description: 'Basketball and badminton indoor arena'
  },
  {
    name: 'Lecture Hall 201',
    building: 'Block C',
    locationDetails: 'Second Floor',
    description: 'Smart lecture room with seating for 100 students'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database for seeding...');

    // Clear existing facilities
    await Facility.deleteMany({});
    console.log('Cleared existing facilities.');

    // Insert new facilities
    await Facility.insertMany(facilitiesData);
    console.log('Database seeded with new facility locations successfully!');

    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
