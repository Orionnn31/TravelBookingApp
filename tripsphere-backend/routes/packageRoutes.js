const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getPackageTime } = require('../controllers/timezoneController');
const {
  createPackage, getAllPackages, getPackageById, updatePackage, deletePackage
} = require('../controllers/packageController');

// Public routes
router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.get('/:id/time', getPackageTime);

// Protected routes
router.post('/', verifyToken, authorizeRoles('agent', 'admin'), createPackage);
router.put('/:id', verifyToken, authorizeRoles('agent', 'admin'), updatePackage);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deletePackage);

module.exports = router;