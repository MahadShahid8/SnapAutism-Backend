import { Psychologist } from "../models/Psychologist.js"; // Adjust the path to your User model
import {Consultation} from "../models/ConsultationCall.js"
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { v4 as uuidv4 } from 'uuid'; 

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//middleware
export const authenticateJWT = (req, res, next) => {
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1]
    : req.cookies.token; // Fallback to cookies if needed

  if (token) {
    jwt.verify(token, process.env.KEY, (err, user) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

// Setup your mail transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});
// Signup controller

export const signup = async (req, res) => {
  try {
    console.log("In signup controller");
    
    const { email } = req.body;
    console.log(email);
    
    // Check if the user already exists
    const userExists = await Psychologist.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: false, message: "User already registered" });
    }
    
    // Generate a random 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create a new user instance with the email and verification code
    const newUser = new Psychologist({
      email,
      verificationCode,
      
    });
    
    await newUser.save();

    // Send verification email with the code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({ status: true, message: "A verification code has been sent to your email. Please enter it to complete registration." });

  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ status: false, message: "An internal error occurred" });
  }
};

// New endpoint for code verification

export const verifyCode = async (req, res) => {
  const { username, email, password, code } = req.body;
  console.log(email);

  try {
    const user = await Psychologist.findOne({ email });

   
    if (user.verificationCode !== code) {
      // If the verification code is invalid, delete the user from the database
      await Psychologist.deleteOne({ _id: user._id }); // Delete the user record
      return res.status(400).json({ status: false, message: "Invalid verification code." });
    }

    console.log(user.verificationCode);

    // Check if the verification code matches
   

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);
    
    // Update the user with the hashed password and username
    user.password = hashPassword;
    user.username = username;
    user.verificationCode = undefined; // Clear the verification code to prevent reuse

    // Save the updated user to the database
    await user.save();

    return res.status(200).json({ status: true, message: "Email verified successfully! Your account is now active." });

  } catch (error) {
    console.error("Verification Error:", error.message);
    return res.status(500).json({ status: false, message: "An internal error occurred." });
  }
};
 

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Psychologist.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User is not registered" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userid: user._id.toString() }, process.env.KEY, {
      expiresIn: "1h",
    });
    console.log(user)

    // For mobile apps, return the token in the response body instead of setting a cookie
    return res.status(200).json({
      status: true,
      message: "Login successful",
      token: token, // Include token in response
      user:user,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
};


// Get user profile controller
export const profile = async (req, res) => {
 
  
  try {
    // Log the req.user to check its structure
    console.log("In profile fetching");
    console.log("user: ",req.user);

    // Check if req.user._id exists and is a valid ObjectId
    if (!req.user || !req.user.userid) {
      return res.status(400).json({ message: "User ID is missing or invalid" });
    }

    // Fetch the user profile
    const user = await Psychologist.findById(req.user.userid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user profile as the response
    console.log("this si the user:",user)
    res.json({ user });
    
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//logout Controller
export const logout = async (req, res) => {
  try {
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({ message: "An error occurred during logout" });
  }
};





// Forgot password controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await Psychologist.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not registered" });
    }

    // Create a token
    const token = jwt.sign({ id: user._id }, process.env.KEY, {
      expiresIn: "5m",
    });

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS, // Use environment variables
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Click the following link to reset your password: http://192.168.1.13:5173/resetPassword/${token}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error,info);
        return res.status(500).json({ message: "Error in sending the email" });
      } else {
        return res.status(200).json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "An error occurred" });
  }
};

// Reset password controller
export const resetPassword = async (req, res) => {
  console.log("Reset password API called");

  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.KEY);
    const userId = decoded.id;

    // Hash the new password
    const hashPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await Psychologist.findByIdAndUpdate(userId, { password: hashPassword });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "An error occurred" });
  }
};



//view all consultations requests
export const viewCallRequests = async (req, res) => {
  try {
    const psychologistId = req.params.psychologistId;

    
    const psychologist = await Psychologist.findById(psychologistId);

    if (!psychologist) {
      return res.status(404).json({ message: 'Psychologist not found' });
    }

    
    if (!psychologist.consultations || psychologist.consultations.length === 0) {
      return res.status(400).json({ message: 'No consultations found for this psychologist' });
    }

    // Find the consultations that are referenced in the 'consultations' array of the psychologist
    const consultations = await Consultation.find({
      _id: { $in: psychologist.consultations }
    });

    // Return the consultations
    return res.status(200).json({
      message: "Consultation requests retrieved successfully",
      consultations
    });
  } catch (error) {
    console.error("Error retrieving consultation requests:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const ReportConsultations = async (req, res) => {
  try {
    const psychologistId = req.params.psychologistId;

    // Validate if the psychologist exists
    const psychologistExists = await Psychologist.exists({ _id: psychologistId });
    if (!psychologistExists) {
      return res.status(404).json({ message: 'Psychologist not found' });
    }

    // Fetch all consultations where the psychologistId matches
    const consultations = await Consultation.find({ psychologistId });

    // If no consultations are found
    if (consultations.length === 0) {
      return res.status(404).json({ message: 'No consultations found for this psychologist' });
    }

    // Return the consultations
    return res.status(200).json({
      status: true,
      message: 'Consultations fetched successfully',
      consultations,
    });
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};



  export const confirmConsultationRequest = async (req, res) => {
    try {
      const { consultationId } = req.params; 
      const { meetLink } = req.body;
  
      // Find the consultation by its ID
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({ status: false, message: 'Consultation not found' });
      }
  
      consultation.status = 'confirmed';
      consultation.meetLink = meetLink;
      
  
      // Save the updated consultation
      await consultation.save();
  
      return res.status(200).json({
        status: true,
        message: "Consultation request confirmed successfully",
        consultation,
      });
    } catch (error) {
      console.error("Error confirming consultation request:", error);
      return res.status(500).json({ status: false, message: "Server error" });
    }
  };

  export const viewPsychologistProfile = async (req, res) => {
    const psychologistId = req.params.psychologistId; // Get the psychologist ID from the request parameters
  
    try {
      // Fetch the psychologist's details from the database
      const psychologist = await Psychologist.findById(psychologistId).select(
        '_id username qualifications specialization bio experienceYears availability bookingLimit'
      );
  
      if (!psychologist) {
        return res.status(404).json({ message: 'Psychologist not found.' });
      }
  
      // Return the psychologist's details
      return res.status(200).json(psychologist);
    } catch (error) {
      console.error('Error fetching psychologist profile:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };
  

  export const setPsychologistProfile = async (req, res) => {
    const psychologistId = req.params.psychologistId;
    console.log("In setPsychologistProfile");

    // Read the request body once and destructure the required fields
    const { specialization, bio, experienceYears, availability,isActive } = req.body;
    console.log(availability);
    

    try {
        let bookingLimit = null;

       
        if (availability && availability.length > 0) {
          const firstAvailability = availability[0];
          const startTimeStr = firstAvailability.startTime; 
          console.log("my start time:", startTimeStr);
      
         
          if (typeof startTimeStr === 'string') {
              
              const [time, modifier] = startTimeStr.split(' ');
              let [hours, minutes] = time.split(':').map(Number);
      
              console.log("time:", time);
      
              
              if (modifier.toLowerCase() === 'pm' && hours < 12) {
                  hours += 12; 
              }
              if (modifier.toLowerCase() === 'am' && hours === 12) {
                  hours = 0; 
              }
      
              console.log("modifier:", modifier);
              console.log("Adjusted hours:", hours);
      
              const today = new Date();
              const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
              console.log("Start time:", startTime.toString()); 
      
             
              bookingLimit = new Date(startTime.getTime() - 4 * 60 * 60 * 1000);
              console.log("Booking Limit:", bookingLimit.toString()); 
      
          } else {
              console.error("Invalid start time format:", startTimeStr);
          }
      } else {
          console.error("No availability found or availability is not an array.");
      }
      

        
        const updatedPsychologist = await Psychologist.findByIdAndUpdate(
            psychologistId,
            {
                specialization,
                bio,
                experienceYears,
                availability, 
                ...(bookingLimit && { bookingLimit }), 
                isActive
            },
            { new: true } 
        );

     
        if (!updatedPsychologist) {
            return res.status(404).json({ message: 'Psychologist not found' });
        }

        console.log(updatedPsychologist);
  
        return res.status(200).json(updatedPsychologist);
    } catch (error) {
        console.error('Error updating psychologist profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateAvailability = async (req, res) => {
  const psychologistId = req.params.psychologistId;
  const { startTime, endTime } = req.body;

  try {
    // Validate input
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Start time and end time are required.' });
    }

    // Find the psychologist
    const psychologist = await Psychologist.findById(psychologistId);
    if (!psychologist) {
      return res.status(404).json({ message: 'Psychologist not found.' });
    }

    // Update the booked status of the specified time slot
    const availabilityUpdated = psychologist.availability.map((slot) => {
      if (slot.startTime === startTime && slot.endTime === endTime) {
        return { ...slot, booked: true }; // Set booked to true
      }
      return slot;
    });

    // Save the updated availability back to the psychologist document
    psychologist.availability = availabilityUpdated;
    await psychologist.save();

    return res.status(200).json({ message: 'Availability updated successfully.' });
  } catch (error) {
    console.error('Error updating availability:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
