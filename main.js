import mongoose from "mongoose";
import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import './scheduler/deletePendingRequests.js';
import cookieParser from "cookie-parser";

import {UserRouter} from './routes/User.js'
import {ChildRouter} from './routes/Child.js'
import {TestRouter} from './routes/Test.js'
import {PsychologistRouter} from './routes/Psychologist.js'
import {ConsultationRouter} from './routes/ConsultationCall.js'
import {ChatRouter} from './routes/Chat.js'
import {ForumRouter} from './routes/ForumRouter.js'


dotenv.config();

const app = express();

// Remove port from .env and only use Render's PORT
const port = process.env.PORT || 10000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("Connected to MongoDB Atlas")
})
.catch((err) => {
  console.log("MongoDB Connection Error:", err)
});

// CORS configuration
const corsOptions = {
  origin: [
    'https://snapautism-backend.onrender.com',

    'http://localhost:8081',
    'http://192.168.1.14:8081',
    'http://192.168.1.13:30001',
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
import  schedule from 'node-schedule';
import  {User} from './models/Users.js'; 
import  {Psychologist} from './models/Psychologist.js';

// Schedule the task for every day at 12 AM
//clearing all user consultations
schedule.scheduleJob('0 0 * * *', async () => {
  try {
    console.log("Running the daily task to clear consultations and update availability...");

    
    await User.updateMany({}, { $set: { consultations: [] } });
    console.log("Cleared consultations for all users.");

    
    await Psychologist.updateMany({}, { $set: { consultations: [] } });
    console.log("Cleared consultations for all psychologists.");

    
    await Psychologist.updateMany(
      {},
      {
        $set: { "availability.$[].booked": false }, 
      }
    );
    console.log("Updated availability for all psychologists, setting 'booked' to false.");

    console.log("Daily task completed successfully.");
  } catch (error) {
    console.error("Error during the daily task:", error);
  }
});

// Add a root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SnapAutism API' });
});

// Your routes
app.use('/auth', UserRouter);
app.use('/children', ChildRouter);
app.use('/test', TestRouter);
app.use('/psychologist', PsychologistRouter);
app.use('/consultation', ConsultationRouter);
app.use('/chat', ChatRouter);
app.use('/forum', ForumRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('Server is running');
  console.log(`Port: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});