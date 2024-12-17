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
import cookieParser from "cookie-parser";


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