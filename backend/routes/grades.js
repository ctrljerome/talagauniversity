const express = require('express');
const router = express.Router();
const { getMyGrades } = require('../controllers/gradePaymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyGrades);

module.exports = router;
