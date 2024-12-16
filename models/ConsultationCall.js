import mongoose from "mongoose";
const { Schema } = mongoose;

const consultationSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  psychologistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Psychologist', required: true },

  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'canceled'], default: 'pending' },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },

  meetLink: { type: String, required: false },

  
  verifiedByUser:{type:Boolean},
  CompletedByPsychologist:{type:Boolean},
  rating: { type: Number, min: 1, max: 5, required: false },
  feedback: { type: String, required: false },
});

export const Consultation = mongoose.model("Consultation", consultationSchema);
