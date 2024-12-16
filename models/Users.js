

// User Schema
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose; 


// User Schema
const UserSchema = new Schema({
  username: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: false },
  resettoken:{type:String,required:false},
  resettokenExpiration:{type:Date,required:false},
  children: [{ type: Types.ObjectId, ref: 'Child' }], // Array of child id references

  consultations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Consultation',  },],
  verificationCode:{ type: String, required: false },


  //for chat 
  requests: [
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      message: {
        type: String,
        
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      username:{ type: String, required: false }
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

});
export const User = mongoose.model("User", UserSchema);
