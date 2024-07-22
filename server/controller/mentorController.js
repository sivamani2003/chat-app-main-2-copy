const mentorModel = require("../models/mentor");
const userModel = require("../models/UserModel");
const bcryptjs = require('bcryptjs');

// Assign a mentor to a user based on subjects
const assignMentor = async (userId, subjects) => {
    try {
        const user = await userModel.findById(userId).populate('mentorAssignments.mentor');
        if (!user) {
            throw new Error("User not found");
        }

        let assignedMentors = [];

        for (const subject of subjects) {
            // Check if a mentor is already assigned for this subject
            const existingAssignment = user.mentorAssignments.find(assignment => assignment.subject === subject);
            if (existingAssignment) {
                assignedMentors.push(existingAssignment.mentor);
            } else {
                // Find mentors that match the subject and sort by the number of users assigned to balance the load
                const mentors = await mentorModel.find({ subjects: subject }).sort('usersAssigned');

                if (mentors.length > 0) {
                    // Assign the mentor with the least number of users assigned
                    const selectedMentor = mentors[0];
                    // Update the mentor's usersAssigned count
                    selectedMentor.usersAssigned += 1;
                    await selectedMentor.save();

                    // Save the new assignment
                    user.mentorAssignments.push({ subject, mentor: selectedMentor._id,name:selectedMentor.name });
                    assignedMentors.push(selectedMentor);
                } else {
                    throw new Error(`No suitable mentor found for the subject: ${subject}`);
                }
            }
        }

        await user.save();
        return assignedMentors;
    } catch (error) {
        throw new Error("Error assigning mentor: " + error.message);
    }
};

// Add a new mentor
const addMentor = async (req, res) => {
    const { name,email,password, subjects } = req.body;

    try {
        const checkEmail = await mentorModel.findOne({ email }) //{ name,email}  // null

        if(checkEmail){
            return res.status(400).json({
                message : "Already user exits",
                error : true,
            })
        }

        const hashpassword = await bcryptjs.hash(password,10)
        const newMentor = new mentorModel({ name,email,password:hashpassword, subjects, usersAssigned: 0 });
        const mentor = await newMentor.save();
        res.json({ success: true, message: "Mentor added", mentor });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding mentor" });
    }
};

// Update a mentor's details
const updateMentor = async (req, res) => {
    const { mentorId } = req.params;
    const { name, subjects } = req.body;

    try {
        const mentor = await mentorModel.findById(mentorId);
        if (!mentor) {
            return res.json({ success: false, message: "Mentor not found" });
        }

        mentor.name = name || mentor.name;
        mentor.subjects = subjects || mentor.subjects;
        await mentor.save();

        res.json({ success: true, message: "Mentor updated", mentor });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating mentor" });
    }
};

// Delete a mentor
const deleteMentor = async (req, res) => {
    const { mentorId } = req.params;

    try {
        const mentor = await mentorModel.findByIdAndDelete(mentorId);
        if (!mentor) {
            return res.json({ success: false, message: "Mentor not found" });
        }

        res.json({ success: true, message: "Mentor deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting mentor" });
    }
};

// Get all mentors according to subjects or all mentors if no subjects are specified
const getAllMentors = async (req, res) => {
    const { subjects, mentorId } = req.query; // Use query params to filter

    try {
        const query = {};
        if (subjects) {
            query.subjects = { $all: subjects.split(',') }; // Split subjects by comma
        }
        if (mentorId) {
            query._id = mentorId;
        }

        const mentors = await mentorModel.find(query);
        res.json({ success: true, mentors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching mentors" });
    }
};

const assignMentorBasedOnSubjectsRoute = async (req, res) => {
    const { userId } = req.params; // Correctly extract userId from route parameters
    const { subjects } = req.body;

    try {
        // Ensure userId is correctly used in findById
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Correctly call assignMentor with userId and subjects
        const assignedMentors = await assignMentor(userId, subjects);
        res.json({ success: true, message: "Mentors assigned based on subjects", mentors: assignedMentors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error assigning mentors based on subjects" });
    }
};
const getMentorUsers = async (req, res) => {
    const { mentorId } = req.params;

    try {
        // Find all users assigned to this mentor
        const users = await userModel.find({ "mentorAssignments.mentor": mentorId }).populate('mentorAssignments.mentor');
        if (!users || users.length === 0) {
            return res.json({ success: false, message: "No users assigned to this mentor" });
        }

        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching users for mentor" });
    }
};

const mentorLogin = async(req,res)=>{
    const {email,password}=req.body;
    try{
        const checkEmail = await mentorModel.findOne({ email });
        console.log(checkEmail)

        if(!checkEmail){
            return res.status(400).json({
                message : "user not found",
                error : true,
            })
        }

        const verifyPassword = await bcryptjs.compare(password,checkEmail.password);
        console.log(verifyPassword)
        if(verifyPassword){
            return res.status(200).json({
                message : "Login successfully",
                token : token,
                success :true
            })
        }
        else{
            return res.status(400).json({
                message:"incorrect password",
                error:true
            })
        }
    }
    catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}


module.exports = { assignMentor, addMentor, updateMentor, deleteMentor, getAllMentors, assignMentorBasedOnSubjectsRoute,getMentorUsers,mentorLogin };