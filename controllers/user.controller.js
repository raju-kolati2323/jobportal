import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname) {
      return res.status(400).json({
        message: "Name is missing",
        success: false,
      });
    }
    if (!email) {
      return res.status(400).json({
        message: "Email is missing",
        success: false,
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone number is missing",
        success: false,
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is missing",
        success: false,
      });
    }

    if (!role) {
      return res.status(400).json({
        message: "Role is missing",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exist with this email.",
        success: false,
      });
    }
    const file = req.file;
    let cloudResponse;

    if (file) {
      try {
        const fileUri = getDataUri(file);
        cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      } catch (uploadError) {
        return res.status(500).json({
          message: "File upload failed",
          success: false,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: cloudResponse ? cloudResponse.secure_url : "",
      },
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email is missing",
        success: false,
      });
    }
    if (!password) {
      return res.status(400).json({
        message: "password is missing",
        success: false,
      });
    }

    if (!role) {
      return res.status(400).json({
        message: "role is missing",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }
    // check role is correct or not
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      });
    }

    const tokenData = {userId: user._id};
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d"
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpsOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
        token,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills, highestQualification, workExperience, projects, socialMediaAccounts } = req.body;
    const file = req.file;

    const userId = req.id; // Get user ID from the authenticated request
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    // Updating data only if provided
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (highestQualification) {
      // Check if highestQualification already exists
      if (user.profile.highestQualification !== highestQualification) {
        user.profile.highestQualification = highestQualification; // Update if changed
      }
    }
    if (skills) {
      user.profile.skills = skills.split(",").map(skill => skill.trim()); // Save skills as an array
    }
    // Update workExperience array
    if (workExperience && Array.isArray(workExperience)) {
      workExperience.forEach(newExperience => {
        const existingExperience = user.profile.workExperience.find(
          exp => exp.companyName === newExperience.companyName
        );

        if (existingExperience) {
          // Update the existing experience
          existingExperience.companyName=newExperience.companyName;
          existingExperience.role = newExperience.role;
          existingExperience.years = newExperience.years;
          existingExperience.months = newExperience.months;
        } else {
          // Add new experience
          user.profile.workExperience.push({
            companyName: newExperience.companyName,
            role: newExperience.role,
            years: newExperience.years,
            months: newExperience.months,
          });
        }
      });
    }

    // Update projects array
    if (projects && Array.isArray(projects)) {
      projects.forEach(newProject => {
        const existingProject = user.profile.projects.find(
          project => project.title === newProject.title
        );

        if (existingProject) {
          // Update the existing project
          existingProject.title=newProject.title;
          existingProject.description = newProject.description;
          existingProject.duration = newProject.duration;
          existingProject.projectLink = newProject.projectLink;
          existingProject.technologiesUsed = Array.isArray(newProject.technologiesUsed)
            ? newProject.technologiesUsed.map(tech => tech.trim())
            : [];
        } else {
          // Add new project
          user.profile.projects.push({
            title: newProject.title,
            description: newProject.description,
            duration: newProject.duration,
            projectLink: newProject.projectLink,
            technologiesUsed: Array.isArray(newProject.technologiesUsed)
              ? newProject.technologiesUsed.map(tech => tech.trim())
              : [],
          });
        }
      });
    }
    if (socialMediaAccounts) {
      if (socialMediaAccounts.linkedIn) user.profile.socialMediaAccounts.linkedIn = socialMediaAccounts.linkedIn;
      if (socialMediaAccounts.instagram) user.profile.socialMediaAccounts.instagram = socialMediaAccounts.instagram;
      if (socialMediaAccounts.github) user.profile.socialMediaAccounts.github = socialMediaAccounts.github;
      if (socialMediaAccounts.personalPortfolio) user.profile.socialMediaAccounts.personalPortfolio = socialMediaAccounts.personalPortfolio;
    }
    // Only upload new file if provided
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      user.profile.resume = cloudResponse.secure_url; // Save the cloudinary URL
      user.profile.resumeOriginalName = file.originalname; // Save the original file name
    }

    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        updatedAt: user.updatedAt,
      },
      success: true,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

export const deleteWorkExperience = async (req, res) => {
  try {
    const userId = req.id; // Extract user ID from authenticated request
    const { id } = req.params; // Get companyName from URL parameter

    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    // Filter out the work experience with the specified companyName
    user.profile.workExperience = user.profile.workExperience.filter(
      (exp) => exp._id.toString()!== id
    );

    await user.save();

    return res.status(200).json({
      message: "Work experience deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const userId = req.id; // Extract user ID from authenticated request
    const { id } = req.params; // Get project title from URL parameter

    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    // Filter out the project with the specified title
    user.profile.projects = user.profile.projects.filter(
      (project) => project._id.toString()!== id
    );

    await user.save();

    return res.status(200).json({
      message: "Project deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    return res.status(200).json({
      users,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};
