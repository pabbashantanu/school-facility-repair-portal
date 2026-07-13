const Complaint = require('../models/Complaint');
const Facility = require('../models/Facility');
const RepairHistory = require('../models/RepairHistory');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student, Teacher)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, facility, severity } = req.body;

    // Verify facility exists
    const facilityExists = await Facility.findById(facility);
    if (!facilityExists) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Store relative path so frontend can easily access
        images.push(`/uploads/${file.filename}`);
      });
    }

    const complaint = await Complaint.create({
      reporter: req.user.id,
      facility,
      title,
      description,
      severity: severity || 'Medium',
      images
    });

    // Create repair history log entry
    await RepairHistory.create({
      complaint: complaint._id,
      action: 'Complaint Created',
      performedBy: req.user.id,
      newStatus: 'Pending Approval',
      notes: 'Initial complaint filed by reporter'
    });

    // Send email notification to reporter
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      email: req.user.email,
      subject: `Complaint Registered: ${complaint.title}`,
      message: `Hello ${req.user.name},\n\nYour facility damage report regarding "${complaint.title}" in "${facilityExists.name}" has been successfully logged. We will review and assign staff shortly.`,
      html: `<h3>Hello ${req.user.name},</h3><p>Your facility damage report regarding <strong>"${complaint.title}"</strong> in <strong>"${facilityExists.name}"</strong> has been successfully logged. We will review and assign staff shortly.</p>`
    });

    res.status(201).json({

      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user complaints
// @route   GET /api/complaints/my
// @access  Private (Student, Teacher)
exports.getMyComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const queryObj = { reporter: req.user.id };

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


// @desc    Get complaint details by ID
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reporter', 'name email role')
      .populate('facility', 'name building locationDetails')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check authorization: Reporters, assigned staff, and Admins can view
    if (
      complaint.reporter._id.toString() !== req.user.id &&
      req.user.role !== 'Admin' &&
      (!complaint.assignedTo || complaint.assignedTo._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    // Get historical log entries
    const history = await RepairHistory.find({ complaint: complaint._id })
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaint,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all facilities (for select options in forms)
// @route   GET /api/complaints/facilities
// @access  Private
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: facilities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assigned complaints for maintenance staff
// @route   GET /api/complaints/assigned
// @access  Private (Maintenance Staff)
exports.getAssignedComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const queryObj = { assignedTo: req.user.id };

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
      .populate('facility', 'name building locationDetails')
      .populate('reporter', 'name email')
      .sort({ updatedAt: -1 })
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


// @desc    Update complaint status / complete repair
// @route   PUT /api/complaints/:id/status
// @access  Private (Maintenance Staff, Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify authorized user (must be assignee or admin)
    if (
      req.user.role !== 'Admin' &&
      (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user.id)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this complaint' });
    }

    const previousStatus = complaint.status;

    if (status === 'Resolved') {
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          images.push(`/uploads/${file.filename}`);
        });
      }

      complaint.status = 'Resolved';
      complaint.completionDetails = {
        notes: notes || 'Repair completed successfully',
        images,
        completedAt: Date.now()
      };
    } else {
      complaint.status = status;
    }

    await complaint.save();

    // Log in RepairHistory
    await RepairHistory.create({
      complaint: complaint._id,
      action: `Status updated to ${status}`,
      performedBy: req.user.id,
      previousStatus,
      newStatus: status,
      notes: notes || `Status updated by ${req.user.name}`
    });

    // Create Notification for the reporter
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: complaint.reporter,
      title: `Complaint Status Updated: ${status}`,
      message: `Your report regarding "${complaint.title}" has been updated to "${status}" by the maintenance team.`,
      type: 'Complaint Status',
      complaint: complaint._id
    });

    // Send email notification to reporter
    const User = require('../models/User');
    const reporterUser = await User.findById(complaint.reporter);
    if (reporterUser) {
      const sendEmail = require('../utils/sendEmail');
      await sendEmail({
        email: reporterUser.email,
        subject: `[Update] Complaint Status: ${status}`,
        message: `Hello ${reporterUser.name},\n\nYour facility damage report regarding "${complaint.title}" has been updated to "${status}".\n\nRemarks: "${notes || 'None'}"`,
        html: `<h3>Hello ${reporterUser.name},</h3><p>Your facility damage report regarding <strong>"${complaint.title}"</strong> has been updated to <strong>"${status}"</strong>.</p><p>Remarks: <em>"${notes || 'None'}"</em></p>`
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


