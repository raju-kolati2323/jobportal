import { Job } from "../models/job.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { PaymentPlan } from "../models/payment.model.js";
import { createPaymentOrder } from "./payment.controller.js";
import { User } from "../models/user.model.js";

// admin post krega job
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      qualification,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    const userId = req.id;

    // Check if the user is a recruiter (admin)
    const user = await User.findById(userId);
    if (user.role !== 'recruiter') {
      return res.status(403).json({
        message: "Only recruiters can post jobs.",
        success: false
      });
    }

    // Get the user's active payment plan
    const paymentPlan = await PaymentPlan.findOne({ adminId: userId, active: true }).sort({ expiryDate: -1 });
    if (!paymentPlan || paymentPlan.expiryDate < new Date()) {
      return res.status(400).json({
        message: "No active payment plan found. Please subscribe to a plan to post jobs.",
        success: false
      });
    }

    // Check if the admin has exceeded the job posting limit for their plan
    if (paymentPlan.jobsPosted >= paymentPlan.jobLimit && paymentPlan.jobLimit !== -1) {
      return res.status(400).json({
        message: "You have reached your job posting limit. Please renew your plan.",
        success: false
      });
    }

    // Check for missing fields and return specific error messages
    if (!title) {
      return res.status(400).json({
        message: "Title is missing.",
        success: false,
      });
    }

    if (!description) {
      return res.status(400).json({
        message: "Description is missing.",
        success: false,
      });
    }

    if (!requirements) {
      return res.status(400).json({
        message: "Requirements are missing.",
        success: false,
      });
    }

    if (!qualification) {
      return res.status(400).json({
        message: "Qualification is missing",
        success: false,
      })
    }

    if (!salary) {
      return res.status(400).json({
        message: "Salary is missing.",
        success: false,
      });
    }

    if (!location) {
      return res.status(400).json({
        message: "Location is missing.",
        success: false,
      });
    }

    if (!jobType) {
      return res.status(400).json({
        message: "Job Type is missing.",
        success: false,
      });
    }

    if (!experience) {
      return res.status(400).json({
        message: "Experience is missing.",
        success: false,
      });
    }

    if (!position) {
      return res.status(400).json({
        message: "Position is missing.",
        success: false,
      });
    }

    if (!companyId) {
      return res.status(400).json({
        message: "Company id is missing.",
        success: false,
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "User id is missing.",
        success: false,
      });
    }

    const job = await Job.create({
      title,
      description,
      qualification,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experience,
      position,
      company: companyId,
      created_by: userId,
      status: "active", // Initially set to active
    });

    // Update the job posting count
    if (paymentPlan.jobLimit !== -1) {
      paymentPlan.jobsPosted += 1;
      if (paymentPlan.jobsPosted >= paymentPlan.jobLimit) {
        paymentPlan.active = false; // Expire the plan if limit reached
      }
      await paymentPlan.save();
    }

    let razorpayOrderId = null;
    try {
      if (paymentPlan.jobLimit === paymentPlan.jobsPosted) {
        const order = await createPaymentOrder(paymentPlan.planType);
        razorpayOrderId = order.id;
        console.log("Razorpay order created:", razorpayOrderId);
      }
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
    }

    // Create a payment order for the new plan or when renewal is needed
    return res.status(201).json({
      message: "Job posted successfully.",
      job,
      razorpayOrderId,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// admin can delete a job
export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findByIdAndDelete(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job deleted successfully.",
      success: true,
      jobId: jobId,
    });
  } catch (error) {
    console.error("Error in deleteJob:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};


// Job Seeker k liye
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $and: [
        { $or: [{ status: "active" }, { status: { $exists: false } }] },
        {
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    res.status(503).json({
      message: "Internal server error",
      success: false,
    });
  }
};
// Job Seeker
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });
    if (!job) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.log(error);
  }
};
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
  
    // Get the admin's active payment plan
    const paymentPlan = await PaymentPlan.findOne({ adminId, active: true }).sort({ expiryDate: -1 });

    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      createdAt: -1,
    });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      paymentPlan, 
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//update job
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const updateData = req.body;

    const file = req.file;
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      updateData.logo = cloudResponse.secure_url;
    }

    const job = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true, // Return the updated job
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job updated successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const toggleJobStatus = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found.", success: false });
    }

    // Toggle between 'active' and 'inactive' status
    job.status = job.status === "active" ? "inactive" : "active";
    await job.save();

    return res.status(200).json({
      message: `Job status updated to ${job.status}.`,
      success: true,
      job
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
