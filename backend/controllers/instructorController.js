const Instructor = require('../models/Instructor');
const sanitize = s => s ? String(s).replace(/[<>"']/g,'') : s;

exports.getInstructors = async (req,res) => {
  try {
    const { search, department } = req.query;
    const filter = {};
    if (department) filter.department = new RegExp(department,'i');
    if (search) filter.$or = [
      { firstName: new RegExp(search,'i') },
      { lastName:  new RegExp(search,'i') },
      { email:     new RegExp(search,'i') },
      { employeeId: new RegExp(search,'i') }
    ];
    const instructors = await Instructor.find(filter).sort({ lastName:1 });
    res.status(200).json({ success:true, count: instructors.length, instructors });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.createInstructor = async (req,res) => {
  try {
    const { firstName, lastName, email, department, designation, specialization, contactNumber } = req.body;
    if (!firstName || !lastName || !email) return res.status(400).json({ success:false, message:'First name, last name and email are required.' });
    const exists = await Instructor.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success:false, message:'Email already registered.' });
    const instructor = await Instructor.create({
      firstName: sanitize(firstName), lastName: sanitize(lastName),
      email: email.toLowerCase(),
      department: sanitize(department), designation: sanitize(designation),
      specialization: sanitize(specialization), contactNumber: sanitize(contactNumber)
    });
    res.status(201).json({ success:true, message:'Instructor created.', instructor });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.updateInstructor = async (req,res) => {
  try {
    const allowed = ['firstName','lastName','department','designation','specialization','contactNumber','isActive'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = sanitize(req.body[f]); });
    const instructor = await Instructor.findByIdAndUpdate(req.params.id, updates, { new:true, runValidators:true });
    if (!instructor) return res.status(404).json({ success:false, message:'Instructor not found.' });
    res.status(200).json({ success:true, message:'Instructor updated.', instructor });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.deleteInstructor = async (req,res) => {
  try {
    await Instructor.findByIdAndUpdate(req.params.id, { isActive:false });
    res.status(200).json({ success:true, message:'Instructor deactivated.' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};
