import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    }, 
    profile:{
        bio:{type:String},
        highestQualification:{type:String},    
        skills:[{type:String}],
        resume:{type:String},
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        },
        workExperience: [
            {
            companyName:{type: String},
            role:{type: String},
            years: { type: Number, default: 0 },
            months: { type: Number, default: 0 }
        }
    ],
        projects: [
            {   
                title: { type: String },
                description:{type: String},
                duration: { type: String },
                projectLink:{type:String},
                technologiesUsed:[{type:String}]
            }
        ],
        socialMediaAccounts: {
            personalPortfolio:{type:String, default:"NA"},
            linkedIn: { type: String, default: "" },
            instagram: { type: String, default: "" },
            github: { type: String, default: "" },
        }
    }
},{timestamps:true});
export const User = mongoose.model('User', userSchema);