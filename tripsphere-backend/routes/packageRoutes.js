const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createPackage, getAllPackages, getPackageById, updatePackage, deletePackage
} = require('../controllers/packageController');

// Public routes
router.get('/', getAllPackages);
router.get('/:id', getPackageById);

// Protected routes
router.post('/', verifyToken, authorizeRoles('agent', 'admin'), createPackage);
router.put('/:id', verifyToken, authorizeRoles('agent', 'admin'), updatePackage);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deletePackage);

module.exports = router;