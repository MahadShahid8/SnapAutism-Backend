import mongoose from "mongoose";
const { Schema, model } = mongoose;

const TestSchema = new Schema({
  testName: { 
    type: String, 
    required: true,
    enum: ['AQ-10', 'QCHAT-10']
  },
  dateTaken: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  result: { 
    type: Number,
    min: 0,
    max: 1
  },
  autism_probability: { 
    type: Number,
    min: 0,
    max: 1
  },
  risk_level: { 
    type: String,
    enum: ['low', 'medium', 'high']
  },
  userResponses: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    enum: ['complete', 'incomplete'],
    default: 'incomplete',
    required: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
TestSchema.index({ dateTaken: -1 });
TestSchema.index({ testName: 1 });

// Add a method to get risk level based on probability
TestSchema.methods.calculateRiskLevel = function() {
  const prob = this.autism_probability;
  if (prob < 0.3) return 'low';
  if (prob < 0.7) return 'medium';
  return 'high';
};

export const Test = mongoose.model("Test", TestSchema);