const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    subjects: [{
        type: String,
        required: true
    }],
    usersAssigned: {
        type: Number,
        default: 0
    }
});

const mentorModel = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);
module.exports = mentorModel;