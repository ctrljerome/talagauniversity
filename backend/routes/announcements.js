const express = require('express');
const router = express.Router();
const { getAnnouncements, getAnnouncement } = require('../controllers/gradePaymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncement);

module.exports = router;
