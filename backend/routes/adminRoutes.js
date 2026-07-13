const express = require('express');
const {
  getAnalytics,
  getUsers,
  updateUser,
  assignComplaint,
  getAllComplaints,
  createFacility,
  updateFacility,
  deleteFacility
} = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply check middleware to all admin routes
router.use(protect);
router.use(authorize('Admin'));

router.get('/analytics', getAnalytics);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);

router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/assign', assignComplaint);

router.post('/facilities', createFacility);
router.put('/facilities/:id', updateFacility);
router.delete('/facilities/:id', deleteFacility);

module.exports = router;
