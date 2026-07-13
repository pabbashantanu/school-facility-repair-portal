const User = require('../models/User');
const Facility = require('../models/Facility');
const Complaint = require('../models/Complaint');
const RepairHistory = require('../models/RepairHistory');
const Notification = require('../models/Notification');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFacilities = await Facility.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    // Group complaints by status
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Group complaints by severity
    const severityCounts = await Complaint.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Group complaints by month
    const monthlyCounts = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Group complaints by facility name
    const facilityCounts = await Complaint.aggregate([
      {
        $group: {
          _id: '$facility',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'facilities',
          localField: '_id',
          foreignField: '_id',
          as: 'facilityDetails'
        }
      },
      { $unwind: '$facilityDetails' },
      {
        $project: {
          name: '$facilityDetails.name',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFacilities,
        totalComplaints,
        statusCounts,
        severityCounts,
        monthlyCounts,
        facilityCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or verification status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { role, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign a complaint to maintenance staff
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res) => {
  try {
    const { staffId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify staff exists
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'Maintenance Staff') {
      return res.status(400).json({ success: false, message: 'Invalid maintenance staff selected' });
    }

    const previousStatus = complaint.status;
    complaint.assignedTo = staffId;
    complaint.status = 'Assigned';
    await complaint.save();

    // Log history
    await RepairHistory.create({
      complaint: complaint._id,
      action: `Assigned to ${staff.name}`,
      performedBy: req.user.id,
      previousStatus,
      newStatus: 'Assigned',
      notes: `Assigned by administrator`
    });

    // Notify Reporter
    await Notification.create({
      recipient: complaint.reporter,
      title: 'Repair In Progress',
      message: `Your report regarding "${complaint.title}" has been assigned to ${staff.name}.`,
      type: 'Job Assignment',
      complaint: complaint._id
    });

    // Notify Staff member
    await Notification.create({
      recipient: staffId,
      title: 'New Job Assigned',
      message: `You have been assigned a repair task: "${complaint.title}".`,
      type: 'Job Assignment',
      complaint: complaint._id
    });

    // Send emails
    const sendEmail = require('../utils/sendEmail');
    
    // Email to staff member
    await sendEmail({
      email: staff.email,
      subject: `New Job Assigned: ${complaint.title}`,
      message: `Hello ${staff.name},\n\nYou have been assigned a new repair task regarding "${complaint.title}". Please log in to your dashboard to review and begin work.`,
      html: `<h3>Hello ${staff.name},</h3><p>You have been assigned a new repair task regarding <strong>"${complaint.title}"</strong>.</p><p>Please log in to your dashboard to review and begin work.</p>`
    });

    // Email to reporter
    const reporterUser = await User.findById(complaint.reporter);
    if (reporterUser) {
      await sendEmail({
        email: reporterUser.email,
        subject: `Repair In Progress: ${complaint.title}`,
        message: `Hello ${reporterUser.name},\n\nYour facility report regarding "${complaint.title}" has been assigned to our maintenance staff: ${staff.name}. We will begin work shortly.`,
        html: `<h3>Hello ${reporterUser.name},</h3><p>Your facility report regarding <strong>"${complaint.title}"</strong> has been assigned to our maintenance staff: <strong>${staff.name}</strong>.</p><p>We will begin work shortly.</p>`
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all complaints list (for Admin Dashboard overview)
// @route   GET /api/admin/complaints
// @access  Private (Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const queryObj = {};

    // Filters
    if (req.query.status && req.query.status !== 'All') {
      queryObj.status = req.query.status;
    }
    if (req.query.severity && req.query.severity !== 'All') {
      queryObj.severity = req.query.severity;
    }
    // Search
    if (req.query.search) {
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(queryObj);
    const complaints = await Complaint.find(queryObj)
      .populate('facility', 'name building')
      .populate('reporter', 'name role')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: complaints.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total
      },
      data: complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- FACILITY CRUD ---

// @desc    Create a new facility
// @route   POST /api/admin/facilities
// @access  Private (Admin)
exports.createFacility = async (req, res) => {
  try {
    const { name, building, locationDetails, description } = req.body;
    
    const facilityExists = await Facility.findOne({ name });
    if (facilityExists) {
      return res.status(400).json({ success: false, message: 'Facility name already exists' });
    }

    const facility = await Facility.create({
      name,
      building,
      locationDetails,
      description
    });

    res.status(201).json({
      success: true,
      data: facility
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update facility
// @route   PUT /api/admin/facilities/:id
// @access  Private (Admin)
exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete facility
// @route   DELETE /api/admin/facilities/:id
// @access  Private (Admin)
exports.deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    await facility.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Facility removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
