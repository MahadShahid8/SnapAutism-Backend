import mongoose from 'mongoose';
const { Schema } = mongoose;


const psychologistSchema = new Schema({
  // Account creation
  username: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String },
  verificationCode:{ type: String, required: false },

  // Profile setup
  specialization: { type: String, trim: true },
  bio: { type: String, trim: true },
  experienceYears: { type: Number, min: 0 },

  // Availability
  availability: [
  ],
  
  isActive: { type: Boolean, default: true }, // Indicates if the psychologist is available for booking

  // Consultation list
  consultations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' }],


  bookingLimit: {
    type: Date,
  
  },
});

export const Psychologist = mongoose.model('Psychologist', psychologistSchema);
