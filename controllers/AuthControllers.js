import { User } from "../models/Users.js"; // Adjust the path to your User model


import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from 'crypto';
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


// Signup controller
export const signup = async (req, res) => {
  try {
    console.log("In signup controller");

    const { email } = req.body;
    console.log(email);

    // Check if the user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      // If the user exists and the status is 'deactivated'
      if (userExists.status === 'deactivated') {
        return res.status(400).json({
          status: false,
          message: "This email is associated with a deactivated account. Use a different email to register again",
          reactivate: true // This indicates to the front end that the user can reactivate the account
        });
      }
      // If the user exists and status is 'active'
      return res.status(400).json({ status: false, message: "User already registered" });
    }

    // Generate a random 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create a new user instance with the email and verification code
    const newUser = new User({
      email,
      verificationCode,
      status: 'active',  // New user is active by default
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

    return res.status(201).json({
      status: true,
      message: "A verification code has been sent to your email. Please enter it to complete registration."
    });

  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ status: false, message: "An internal error occurred" });
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
 


 

// New endpoint for code verification
export const verifyCode = async (req, res) => {
  const { username, email, password, code } = req.body;
  console.log(code);

  try {
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found." });
    }

    console.log(user.verificationCode);

    // Check if the verification code matches
    if (user.verificationCode !== code) {
      // If the verification code is invalid, delete the user from the database
      await User.deleteOne({ _id: user._id }); // Delete the user record
      return res.status(400).json({ status: false, message: "Invalid verification code." });
    }

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
  console.log("in controller");

  try {
    
    const user = await User.findOne({ email });
    
 
    if (!user || user.status !== "active") {
      return res.status(400).json({ message: "User is not registered" });
    }

   
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("Invalid password");
      return res.status(400).json({ message: "Invalid password" });
    }

   
    const token = jwt.sign({ userid: user._id.toString() }, process.env.KEY, {
      expiresIn: "1h",
    });


    console.log("Login successful, generating token...");
    console.log(user);
    return res.status(200).json({
      status: true,
      message: "Login successful",
      token: token, 
      user: user,
    });

  } catch (error) {
    
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
};




export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userid);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ user:user });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not registered" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

    // Save token and expiration to user record
    user.resettoken = resetToken;
    user.resettokenExpiration = resetTokenExpiration;
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password (use an app password if using Gmail)
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Receiver address
      subject: 'Password Reset Request',
      text: `You requested a password reset. Use this token to reset your password: ${resetToken}. The token is valid for 1 hour.`,
      html: `<p>You requested a password reset.</p><p>Use this token to reset your password: <strong>${resetToken}</strong></p><p>The token is valid for 1 hour.</p>`, // You can send an HTML email
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error in sending the email' });
      }
      console.log('Email sent:', info.response);
      return res.status(200).json({ message: 'Reset token sent to email', resetToken });
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};


// Reset password controller
export const resetPassword = async (req, res) => {
  console.log("Reset password API called");

try{  const email = req.body.email
  const verificationCode = req.body.verificationCode

  const  password  = req.body.password;


  const user = await User.findOne({email})
  if(!user || user.resettoken !==  verificationCode){
    return res.status(400).send({success:false}) 
   }

   if(user.resettokenExpiration<new Date())
   {
    return res.status(400).send({success:false,message:"token has expired"})
   }

   const hashedPassword = await bcrypt.hash(password,10);
   user.password = hashedPassword
  await user.save()
  return res.status(200).send({success:true})
}
catch(error)
{
  console.log(error);
  return res.status(500).send({success:false,message:"an error occured"})
}
};





export const deleteAccount = async (req, res) => {
  const { myuserId } = req.params;
  console.log(myuserId)

  try {
    // Find the user by userId and update the status to "deactivated"
    const user = await User.findById(myuserId);

    if (!user) {
      return res.status(404).json({ // HTTP Status 404 - Not Found
        message: "User not found",
      });
    }

    // Update the user's status to "deactivated"
    user.status = "deactivated";
    await user.save(); // Save the changes to the database

    return res.status(200).json({ // HTTP Status 200 - OK
      message: "Account deactivated successfully",
      user: {
        id: user._id,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return res.status(500).json({ // HTTP Status 500 - Internal Server Error
      message: "Something went wrong. Please try again later.",
    });
  }
};