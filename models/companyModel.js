import mongoose from "mongoose";
const companySchmema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    website: { type: String },
    location: { type: String },
    logo: { type: String }, // url of company logo
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true
    }
}, { timestamps: true })

const companyModel = mongoose.model("Company", companySchmema)
export default companyModel;