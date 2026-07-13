const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a facility name'],
      trim: true,
      unique: true
    },
    building: {
      type: String,
      required: [true, 'Please specify the building or wing'],
      trim: true
    },
    locationDetails: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Operational', 'Under Maintenance', 'Requires Attention'],
      default: 'Operational'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Facility', facilitySchema);
