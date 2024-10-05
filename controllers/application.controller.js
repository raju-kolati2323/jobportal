import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { sendMail } from "../utils/nodemailer.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        // create a new application
        const newApplication = await Application.create({
            job:jobId,
            applicant:userId,
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"Job applied successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}},
            }
        });
        if(!application){
            return res.status(404).json({
                message:"No Applications",
                success:false
            })
        };
        return res.status(200).json({
            application,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:'applications',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant'
            }
        });
        if(!job){
            return res.status(404).json({
                message:'Job not found.',
                success:false
            })
        };
        return res.status(200).json({
            job, 
            succees:true
        });
    } catch (error) {
        console.log(error);
    }
}
export const updateStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const applicationId = req.params.id;
  
      // Find the application and populate job details
      const applicationDetails = await Application.findById(applicationId).populate({
        path: 'job', // Populate the job details
      });
  
      if (!applicationDetails) {
        return res.status(404).json({
          message: "Application not found.",
          success: false
        });
      }
  
      const userId = applicationDetails.applicant;
      const user = await User.findById(userId);
  
      if (!status) {
        return res.status(400).json({
          message: 'Status is required',
          success: false
        });
      }
  
      // Send email with both plain text and HTML body
      await sendMail(
        user.email,               // recipient email
        'Update on Your Application',  // subject
        `Your application for the position of ${applicationDetails.job.title} has been ${status}.`, // Plain text body
        `
          <h3>Application Status Update</h3>
          <p>Dear Applicant,</p>
          <p>We are pleased to inform you that your application for the position of <strong>${applicationDetails.job.title}</strong> has been <strong>${status}</strong>.</p>
          <p>We will keep you informed about further steps in the hiring process.</p>
          <p>Thank you for applying!</p>
          <p>Best regards,<br>Company Name</p>
        ` // HTML body
      );
  
      // Update the application status
      applicationDetails.status = status;
      await applicationDetails.save();
  
      return res.status(200).json({
        message: "Status updated successfully.",
        success: true
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
        success: false
      });
    }
  };
  