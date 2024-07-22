// routes.js
const express = require('express');
const {
    assignMentorBasedOnSubjectsRoute,
    addMentor,
    updateMentor,
    deleteMentor,
    getAllMentors,
    getMentorUsers,
    mentorLogin,
} = require('../controller/mentorController');

const router = express.Router();

// Route for logging in
router.post('/login',mentorLogin);

// Route for adding a new mentor
router.post('/add', addMentor);

// Route for updating an existing mentor
router.put('/update/:mentorId', updateMentor);

// Route for deleting a mentor
router.delete('/delete/:mentorId', deleteMentor);

// Route for getting all mentors (filtered by subjects or all if no subjects are specified)
router.get('/all', getAllMentors);

// Route for assigning a mentor based on subjects
router.post('/assign-mentor/:userId', assignMentorBasedOnSubjectsRoute);
router.get("/mentor-users/:mentorId", getMentorUsers);

router

module.exports = router