import mongoose from "mongoose";
import express from "express";
import cors from 'cors';
import './scheduler/deletePendingRequests.js';

import {UserRouter} from './routes/User.js'
import {ChildRouter} from './routes/Child.js'
import {TestRouter} from './routes/Test.js'
import {PsychologistRouter} from './routes/Psychologist.js'
import {ConsultationRouter} from './routes/ConsultationCall.js'
import {ChatRouter} from './routes/Chat.js'
import {ForumRouter} from './routes/ForumRouter.js'


import cookieParser from "cookie-parser";

// Use your existing MongoDB Atlas connection
mongoose.connect("mongodb+srv://SnapAutism:abcd1234@cluster0.mtkg0.mongodb.net/SnapAutism?retryWrites=true&w=majority&appName=Cluster0", {
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
const port = 30001



const corsOptions = {
  origin: ['http://localhost:8081', 'http://192.168.1.14:8081', 'http://192.168.1.13:30001'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json())
app.use(cookieParser())




//App routes:

//for user authentication
app.use('/auth',UserRouter)  

//for child management
app.use('/children',ChildRouter)

//for test management
app.use('/test',TestRouter)




//for Psychologist
app.use('/psychologist',PsychologistRouter)


app.use('/consultation',ConsultationRouter)


app.use('/chat',ChatRouter)

app.use('/forum',ForumRouter)



//home route
// app.use('/',HomeRouter)



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})