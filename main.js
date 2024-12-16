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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connected to MongoDB Atlas")
})
.catch((err) => {
  console.log("MongoDB Connection Error:", err)
});

const app = express()
const port = process.env.PORT || 30001

// Updated CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://192.168.1.14:8081',
    'http://192.168.1.13:30001',
    'https://snapautism-backend.onrender.com' // Add your frontend domain when deployed
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/auth', UserRouter)
app.use('/children', ChildRouter)
app.use('/test', TestRouter)
app.use('/psychologist', PsychologistRouter)
app.use('/consultation', ConsultationRouter)
app.use('/chat', ChatRouter)
app.use('/forum', ForumRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})