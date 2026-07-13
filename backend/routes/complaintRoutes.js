const express = require('express');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getFacilities,
  getAssignedComplaints,
  updateComplaintStatus
} = require('../controllers/complaintController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Fetch facilities list (for issue reporting form)
router.get('/facilities', protect, getFacilities);

// Maintenance Staff routes
router.get('/assigned', protect, authorize('Maintenance Staff'), getAssignedComplaints);
router.put('/:id/status', protect, authorize('Maintenance Staff', 'Admin'), upload.array('images', 5), updateComplaintStatus);

// User-specific routes
router.post(
  '/',
  protect,
  authorize('Student', 'Teacher'),
  upload.array('images', 5),
  createComplaint
);

router.get('/my', protect, authorize('Student', 'Teacher'), getMyComplaints);

// Detail lookup
router.get('/:id', protect, getComplaintById);

module.exports = router;

