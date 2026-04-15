require('dotenv').config();
const mongoose    = require('mongoose');
const User        = require('../models/User');
const Course      = require('../models/Course');
const Grade       = require('../models/Grade');
const Payment     = require('../models/Payment');
const Announcement= require('../models/Announcement');
const Instructor  = require('../models/Instructor');
const connectDB   = require('../config/db');

const seed = async () => {
  await connectDB();
  console.log('\n🌱  Seeding Talaga University database...\n');

  // ── Clear all collections ──────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}), Course.deleteMany({}), Grade.deleteMany({}),
    Payment.deleteMany({}), Announcement.deleteMany({}), Instructor.deleteMany({})
  ]);
  console.log('🗑️   Cleared all collections.');

  // ── Admin ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    firstName: 'System', lastName: 'Administrator',
    email: 'admin@university.edu', password: 'Admin@12345', role: 'admin', isActive: true
  });
  console.log('✅  Admin:    admin@university.edu  /  Admin@12345');

  // ── Instructors ────────────────────────────────────────────────────────────
  const instructors = await Instructor.insertMany([
    { employeeId:'TU-2024-1001', firstName:'Ana',     lastName:'Reyes',     email:'ana.reyes@talaga.edu.ph',     department:'Computer Science', designation:'Associate Professor', specialization:'Programming, Data Structures' },
    { employeeId:'TU-2024-1002', firstName:'Carlos',  lastName:'Mendoza',   email:'carlos.mendoza@talaga.edu.ph',department:'Computer Science', designation:'Professor',           specialization:'Algorithms, Database Systems' },
    { employeeId:'TU-2024-1003', firstName:'Liza',    lastName:'Gomez',     email:'liza.gomez@talaga.edu.ph',    department:'Mathematics',      designation:'Assistant Professor', specialization:'Algebra, Calculus' },
    { employeeId:'TU-2024-1004', firstName:'Rose',    lastName:'Aguilar',   email:'rose.aguilar@talaga.edu.ph',  department:'English',          designation:'Instructor',          specialization:'Technical Writing, Communication' },
    { employeeId:'TU-2024-1005', firstName:'Mark',    lastName:'Tan',       email:'mark.tan@talaga.edu.ph',      department:'Computer Science', designation:'Associate Professor', specialization:'Web Development, UI/UX' },
    { employeeId:'TU-2024-1006', firstName:'Roy',     lastName:'Villanueva',email:'roy.villanueva@talaga.edu.ph',department:'Physical Education',designation:'Instructor',          specialization:'Sports Science, Wellness' },
  ]);
  console.log(`✅  ${instructors.length} instructors created.`);

  // ── Students ───────────────────────────────────────────────────────────────
  const student1 = await User.create({
    studentId:'2024-10001', firstName:'Maria', lastName:'Santos',
    email:'maria.santos@student.edu', password:'Student@123', role:'student',
    program:'BS Computer Science', yearLevel:2, section:'CS-2A',
    contactNumber:'09171234567', address:'Talaga, Capas, Tarlac'
  });
  const student2 = await User.create({
    studentId:'2024-10002', firstName:'Juan', lastName:'Dela Cruz',
    email:'juan.delacruz@student.edu', password:'Student@123', role:'student',
    program:'BS Information Technology', yearLevel:3, section:'IT-3B',
    contactNumber:'09281234567', address:'Bamban, Tarlac'
  });
  const student3 = await User.create({
    studentId:'2024-10003', firstName:'Sofia', lastName:'Reyes',
    email:'sofia.reyes@student.edu', password:'Student@123', role:'student',
    program:'BS Computer Science', yearLevel:1, section:'CS-1A',
    contactNumber:'09351234567', address:'Capas, Tarlac'
  });
  console.log('✅  3 students created.');
  console.log('    maria.santos@student.edu  /  Student@123');
  console.log('    juan.delacruz@student.edu /  Student@123');
  console.log('    sofia.reyes@student.edu   /  Student@123');

  // ── Courses ────────────────────────────────────────────────────────────────
  const courses = await Course.insertMany([
    {
      courseCode:'CS101', courseName:'Introduction to Computing',
      description:'Fundamentals of computer science, programming logic, and problem solving.',
      units:3, instructor:'Prof. Ana Reyes', department:'Computer Science',
      schedule:[{day:'Monday',startTime:'07:30',endTime:'09:00',room:'ICT-101'},{day:'Wednesday',startTime:'07:30',endTime:'09:00',room:'ICT-101'}],
      maxStudents:40, enrolledCount:3, semester:'1st', academicYear:'2024-2025', tuitionPerUnit:600
    },
    {
      courseCode:'CS201', courseName:'Data Structures and Algorithms',
      description:'Study of data structures, algorithm design, analysis, and complexity.',
      units:3, instructor:'Prof. Carlos Mendoza', department:'Computer Science',
      schedule:[{day:'Tuesday',startTime:'10:30',endTime:'12:00',room:'ICT-201'},{day:'Thursday',startTime:'10:30',endTime:'12:00',room:'ICT-201'}],
      maxStudents:35, enrolledCount:1, semester:'1st', academicYear:'2024-2025', tuitionPerUnit:600
    },
    {
      courseCode:'MATH101', courseName:'College Algebra',
      description:'Functions, equations, inequalities, matrices, and their applications.',
      units:3, instructor:'Prof. Liza Gomez', department:'Mathematics',
      schedule:[{day:'Monday',startTime:'13:00',endTime:'14:30',room:'Math-105'},{day:'Friday',startTime:'13:00',endTime:'14:30',room:'Math-105'}],
      maxStudents:45, enrolledCount:2, semester:'1st', academicYear:'2024-2025', tuitionPerUnit:500
    },
    {
      courseCode:'ENG101', courseName:'Technical Communication',
      description:'Writing and communication skills for technology professionals.',
      units:3, instructor:'Prof. Rose Aguilar', department:'English',
      schedule:[{day:'Wednesday',startTime:'15:00',endTime:'16:30',room:'Eng-203'},{day:'Friday',startTime:'10:30',endTime:'12:00',room:'Eng-203'}],
      maxStudents:40, enrolledCount:1, semester:'1st', academicYear:'2024-2025', tuitionPerUnit:500
    },
    {
      courseCode:'CS301', courseName:'Web Development',
      description:'Full-stack web development using modern technologies including Node.js, Express, and MongoDB.',
      units:3, instructor:'Prof. Mark Tan', department:'Computer Science',
      schedule:[{day:'Tuesday',startTime:'13:00',endTime:'14:30',room:'ICT-Lab1'},{day:'Thursday',startTime:'13:00',endTime:'14:30',room:'ICT-Lab1'}],
      maxStudents:30, enrolledCount:1, semester:'1st', academicYear:'2024-2025', tuitionPerUnit:650
    },
    {
      courseCode:'PE101', courseName:'Physical Education 1',
      description:'Basic physical fitness, sports appreciation, and wellness.',
      units:2, instructor:'Coach Roy Villanueva', department:'Physical Education',
      schedule:[{day:'Saturday',startTime:'08:00',endTime:'10:00',room:'Gymnasium'}],
      maxStudents:50, enrolledCount:3, semester:'1st', academicYear:'2024-2025', tuitionPerUnit:400
    },
    {
      courseCode:'CS102', courseName:'Computer Programming 1',
      description:'Introduction to programming using Python. Covers variables, control structures, functions, and basic OOP.',
      units:3, instructor:'Prof. Ana Reyes', department:'Computer Science',
      schedule:[{day:'Tuesday',startTime:'07:30',endTime:'09:00',room:'ICT-Lab2'},{day:'Thursday',startTime:'07:30',endTime:'09:00',room:'ICT-Lab2'}],
      maxStudents:35, enrolledCount:1, semester:'1st', academicYear:'2024-2025', tuitionPerUnit:600
    },
  ]);
  console.log(`✅  ${courses.length} courses created.`);

  // ── Enroll students ────────────────────────────────────────────────────────
  // Student 1: CS101, MATH101, PE101
  const s1courses = [courses[0], courses[2], courses[5]];
  student1.enrolledCourses = s1courses.map(c => c._id);
  await student1.save({ validateBeforeSave: false });

  // Student 2: CS201, CS301, CS101
  const s2courses = [courses[1], courses[4], courses[0]];
  student2.enrolledCourses = s2courses.map(c => c._id);
  await student2.save({ validateBeforeSave: false });

  // Student 3: CS101, CS102, MATH101, PE101, ENG101
  const s3courses = [courses[0], courses[6], courses[2], courses[5], courses[3]];
  student3.enrolledCourses = s3courses.map(c => c._id);
  await student3.save({ validateBeforeSave: false });
  console.log('✅  Students enrolled in courses.');

  // ── Grades ─────────────────────────────────────────────────────────────────
  const gradeData = [
    // Maria Santos
    { student:student1._id, course:courses[0]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:88, midtermGrade:91, finalGrade:90 },
    { student:student1._id, course:courses[2]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:92, midtermGrade:89, finalGrade:91 },
    { student:student1._id, course:courses[5]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:95, midtermGrade:97, finalGrade:96 },
    // Juan Dela Cruz
    { student:student2._id, course:courses[1]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:82, midtermGrade:85 },
    { student:student2._id, course:courses[4]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:90, midtermGrade:93 },
    { student:student2._id, course:courses[0]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:78, midtermGrade:80 },
    // Sofia Reyes
    { student:student3._id, course:courses[0]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:94, midtermGrade:96, finalGrade:95 },
    { student:student3._id, course:courses[6]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:88, midtermGrade:90 },
    { student:student3._id, course:courses[2]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:85, midtermGrade:88, finalGrade:89 },
    { student:student3._id, course:courses[5]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:97, midtermGrade:98, finalGrade:97 },
    { student:student3._id, course:courses[3]._id, semester:'1st', academicYear:'2024-2025', prelimGrade:91, midtermGrade:89 },
  ];
  for (const g of gradeData) { const gr = new Grade(g); await gr.save(); }
  console.log(`✅  ${gradeData.length} grade records seeded.`);

  // ── Payments ───────────────────────────────────────────────────────────────
  const p1tuition = s1courses.reduce((s,c) => s + (c.units * c.tuitionPerUnit), 0);
  const pay1 = new Payment({
    student: student1._id, semester:'1st', academicYear:'2024-2025',
    tuitionFee: p1tuition, miscFee: 800, labFee: 500, registrationFee: 300,
    transactions: [
      { amount:5000, method:'GCash',            referenceNumber:'GC-20241001', date: new Date('2024-10-01') },
      { amount:3000, method:'Online Transfer',   referenceNumber:'OT-20241015', date: new Date('2024-10-15') },
    ]
  });
  await pay1.save();

  const p2tuition = s2courses.reduce((s,c) => s + (c.units * c.tuitionPerUnit), 0);
  const pay2 = new Payment({
    student: student2._id, semester:'1st', academicYear:'2024-2025',
    tuitionFee: p2tuition, miscFee: 800, labFee: 1000, registrationFee: 300,
    transactions: []
  });
  await pay2.save();

  const p3tuition = s3courses.reduce((s,c) => s + (c.units * c.tuitionPerUnit), 0);
  const pay3 = new Payment({
    student: student3._id, semester:'1st', academicYear:'2024-2025',
    tuitionFee: p3tuition, miscFee: 800, labFee: 600, registrationFee: 300,
    transactions: [
      { amount:10000, method:'Bank Deposit', referenceNumber:'BD-20240915', date: new Date('2024-09-15') },
    ]
  });
  await pay3.save();
  console.log('✅  Payment records seeded.');

  // ── Announcements ──────────────────────────────────────────────────────────
  await Announcement.insertMany([
    {
      title: '🎓 Welcome to AY 2024-2025, 1st Semester!',
      content: 'The University Administration warmly welcomes all students to the First Semester of Academic Year 2024-2025. Classes officially begin on August 12, 2024. Please ensure all enrollment requirements are settled at the Registrar\'s Office. We wish everyone a productive and successful semester. Mabuhay ang Talaga University — established 1669, serving excellence for over three centuries.',
      type:'general', isGlobal:true, isPinned:true, createdBy:admin._id, publishedAt:new Date('2024-08-01')
    },
    {
      title: '⚠️ Deadline: Adding & Dropping of Subjects — August 30, 2024',
      content: 'All students who wish to add or drop subjects for the 1st Semester AY 2024-2025 must do so on or before August 30, 2024. No changes in enrollment shall be entertained after this deadline. Please coordinate with your respective Department Heads and the Registrar\'s Office.',
      type:'academic', isGlobal:true, isPinned:true, createdBy:admin._id, publishedAt:new Date('2024-08-10'), expiresAt:new Date('2024-08-30')
    },
    {
      title: '💳 Tuition Payment Deadline — September 15, 2024',
      content: 'The deadline for full payment of tuition and other fees for the 1st Semester AY 2024-2025 is September 15, 2024. Students with outstanding balances may be subject to enrollment hold. Please settle your accounts at the Cashier\'s Office or through our official online payment channels (GCash, Maya, Bank Transfer). For inquiries, call (045) 000-0000.',
      type:'payment', isGlobal:true, createdBy:admin._id, publishedAt:new Date('2024-08-20')
    },
    {
      title: '📅 Midterm Examination Schedule — October 14–18, 2024',
      content: 'The schedule for the 1st Semester Midterm Examinations has been released. Examinations will be held from October 14 to 18, 2024. Students are required to bring their school ID and examination permits on all exam days. Please check the bulletin boards in your respective departments for your specific room assignments.',
      type:'academic', isGlobal:true, createdBy:admin._id, publishedAt:new Date('2024-10-01')
    },
    {
      title: '🎉 Talaga University 355th Foundation Day — October 25, 2024',
      content: 'In celebration of our 355th Foundation Day, all classes are suspended on October 25, 2024. The day\'s events include the Foundation Day Parade, Cultural Show, Sports Fest Finals, and Alumni Homecoming Night at the Talaga University Main Campus. All students, faculty, and staff are encouraged to participate. Long live Talaga University!',
      type:'event', isGlobal:true, createdBy:admin._id, publishedAt:new Date('2024-10-15')
    },
    {
      title: '🚨 Library Hours Extension During Finals Week',
      content: 'The Talaga University Library will be open from 6:00 AM to 10:00 PM during the Final Examination period (November 18–22, 2024). Students are reminded to bring their school IDs to access library facilities. Computer laboratories will also be available for student use during extended hours.',
      type:'urgent', isGlobal:true, createdBy:admin._id, publishedAt:new Date('2024-11-10')
    },
  ]);
  console.log('✅  6 announcements seeded.');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✨  Seeding complete!\n');
  console.log('═══════════════════════════════════════════════════');
  console.log(' TALAGA UNIVERSITY  ·  Est. 1669  ·  Sample Data   ');
  console.log('═══════════════════════════════════════════════════');
  console.log(' 🔑 Admin:     admin@university.edu       Admin@12345');
  console.log(' 👩 Student 1: maria.santos@student.edu   Student@123');
  console.log(' 👨 Student 2: juan.delacruz@student.edu  Student@123');
  console.log(' 👩 Student 3: sofia.reyes@student.edu    Student@123');
  console.log('═══════════════════════════════════════════════════\n');

  process.exit(0);
};

seed().catch(err => { console.error('❌  Seeding error:', err.message); process.exit(1); });
