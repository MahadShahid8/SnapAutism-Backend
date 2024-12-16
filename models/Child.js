import mongoose from "mongoose";
const { Schema, model, Types } = mongoose; 

// Child Schema
const ChildSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  tests: [{ type: Types.ObjectId, ref: 'Test' }] ,
  ageUnit:{ type: String }

});

export const Child = mongoose.model("Child", ChildSchema);
