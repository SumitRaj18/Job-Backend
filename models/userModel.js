import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "recruiter"], required: true },
    profile: {
        bio: { type: String },
        skills: [{ type: String }],
        resume: { type: String }, // File path
        resumeOriginalName: { type: String },
        company: {
            type: mongoose.Schema.Types.ObjectId, ref: "Company",
            // required: true
        },
        profilePhoto: { type: String, default: "" }
    }
}, { timestamps: true })

const userModel = mongoose.model("User", userSchema);
export default userModel