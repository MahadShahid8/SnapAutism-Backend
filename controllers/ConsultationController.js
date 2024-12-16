// requestConsultationCall,PaymentProofUpload
import { Consultation } from "../models/ConsultationCall.js"; // Import Consultation model
import {Psychologist} from "../models/Psychologist.js"; // Import Psychologist model
import {User} from "../models/Users.js"; // Import User model (if needed for validation)




export const requestConsultation = async (req, res) => {
  const psychologistId = req.params.psychologistId;
  console.log("in request")
  const { timeSlot, userId } = req.body;
  console.log(timeSlot)

  try {
    // Validate input
    if (!userId  || !timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
      return res.status(400).json({ message: 'User ID, selected date, and time slot are required.' });
    }

    // Check if the psychologist exists
    const psychologist = await Psychologist.findById(psychologistId);
    if (!psychologist) {
      return res.status(404).json({ message: 'Psychologist not found.' });
    }

    // Create a new consultation object
    const consultation = new Consultation({
      userId,
      psychologistId,
     
      timeSlot,
    });

    // Save the consultation to the database
    await consultation.save();

    // Update the psychologist's consultations array
    psychologist.consultations.push(consultation._id);
    await psychologist.save(); // Save the updated psychologist document

    // Return the created consultation object
    return res.status(201).json(consultation);
  } catch (error) {
    console.error('Error requesting consultation:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

  export const viewConsultationRequests = async (req, res) => {
    try {
      
      const { userId } = req.params; // Get the user ID from the request parameters
  
      // Validate if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      // Find all consultations associated with the user
      const consultations = await Consultation.find({ userId: user._id }).populate('psychologistId');
      console.log(consultations)
      // Check if there are any consultations
      if (consultations.length === 0) {
        return res.status(404).json({ status: false, message: 'No consultation requests found for this user' });
      }
  
      // Return the consultation requests with user data
      return res.status(200).json({
        status: true,
        message: "Consultation requests retrieved successfully",
        consultations,
      });
    } catch (error) {
      console.error("Error retrieving consultation requests:", error);
      return res.status(500).json({ status: false, message: "Server error" });
    }
  };


  export const getAllPsychologists = async (req, res) => {
    try {
      const psychologists = await Psychologist.find(); // Fetch all psychologists
      res.status(200).json(psychologists);  // Respond with the data
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      res.status(500).json({ message: 'Server error while fetching psychologists' });
    }
  };


  export const confirmMeetingCompletionByPsychologist = async (req, res) => {
    try {
      const consultationId = req.params.consultationId;
  
      // Find the consultation by ID
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }
  
      // Update the meeting status to 'completed' and set CompletedByPsychologist to true
      consultation.status = 'completed';
      consultation.CompletedByPsychologist = true; // Assuming this field exists in the Consultation model
      await consultation.save();
  
      res.status(200).json({ message: 'Meeting status updated successfully' });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: 'Server error' });
    }
  };
  



// Controller function to update the rating for a consultation
export const submitConsultationRating = async (req, res) => {
  const { consultationId } = req.params; // Get consultation ID from URL parameters
  const { rating, feedback } = req.body; // Get the new rating and feedback from the request body

  // Validate rating
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  try {
    // Find the consultation by ID and update the rating, verifiedByUser, and feedback
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { 
        rating, // Update the rating field
        verifiedByUser: true, // Set verifiedByUser to true
        feedback // Add feedback
      },
      { new: true } // Return the updated consultation
    );

    // Check if consultation was found and updated
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found.' });
    }

    // Respond with the updated consultation
    return res.status(200).json(consultation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating rating', error: error.message });
  }
};
