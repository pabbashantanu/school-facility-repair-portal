const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a short title for the complaint'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add detailed description of the damage'],
      trim: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending Approval'
    },
    images: [
      {
        type: String // URL or file path of uploaded images
      }
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    completionDetails: {
      notes: {
        type: String,
        trim: true
      },
      images: [
        {
          type: String // Completion images uploaded by maintenance staff
        }
      ],
      completedAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
