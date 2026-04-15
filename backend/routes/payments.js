const express = require('express');
const router = express.Router();
const { getMyPayments } = require('../controllers/gradePaymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyPayments);

module.exports = router;
