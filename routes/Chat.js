import express from 'express'

import {getAllUsers,sendRequest,getAllRequests,acceptRequest,getFriends,sendMessage,getMessages} from "../controllers/ChatController.js"
const router = express.Router();



//for chat module user managment

//to get all users
router.get('/users/:userId', getAllUsers);
  

//to send request to users
router.post('/sendrequest', sendRequest);
  
//to get all requests  
router.get("/getrequests/:userId", getAllRequests)

//to accept request
router.post("/acceptrequest",acceptRequest)
  
//to get all friends
router.get("/user/:userId",getFriends)
  
//to send a meesage 
router.post('/sendMessage', sendMessage);

//to get messages
router.get('/messages', getMessages);


  export {router as ChatRouter}