const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/me', (req, res) => res.json({ success: true, user: req.user }));

module.exports = router;
