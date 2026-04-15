const express = require('express');
const router  = express.Router();
const { getInstructors, createInstructor, updateInstructor, deleteInstructor } = require('../controllers/instructorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/',         getInstructors);
router.post('/',        createInstructor);
router.put('/:id',      updateInstructor);
router.delete('/:id',   deleteInstructor);

module.exports = router;
