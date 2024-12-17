
import {User} from '../models/Users.js'
import { Message } from '../models/message.js';

export const getAllUsers =  async (req, res) => {
    try {
      const userId = req.params.userId;
      const users = await User.find({_id: {$ne: userId}});
  
      res.json(users);
    } catch (error) {
      console.log('Error', error);
    }
  }


  export const sendRequest =   async (req, res) => {
    const { senderId, receiverId, message,username } = req.body;
  
    try {
      console.log(senderId);
      console.log(receiverId);
      console.log(message);
  
      // Find the receiver by ID
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }
  
      // Find the sender by ID
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
  
      // Check if the receiver is already in the sender's friends array
      if (sender.friends.includes(receiverId)) {
        return res.status(400).json({ message: 'This person is already your friend.' });
      }
  
      // Check if a request from the sender already exists in the receiver's requests
      const requestExists = receiver.requests.some(
        (request) => request.from.toString() === senderId
      );
  
      if (requestExists) {
        return res.status(400).json({ message: 'Request already sent to this person.' });
      }
  
      // Add the new request if it doesn't already exist
      receiver.requests.push({ from: senderId, message,username });
      await receiver.save();
  
      return res.status(200).json({ message: 'Request sent successfully' });
    } catch (error) {
      console.error("Error sending request:", error);
      return res.status(500).json({ message: 'An error occurred while sending the request' });
    }
  }  



  
  export const getAllRequests =  async(req,res)=>{
    try{
      const userId = req.params.userId;
      const user = await User.findById(userId).populate("requests.from","name email image");
      if(user){
        res.json(user.requests);
      } else{
        res.status(404).json({message: 'User not found'});
      }
    
    }  catch(error){
      console.log(error)
    }
  }



  export const acceptRequest =  async(req,res)=>{
    try{
      const {userId, requestId} = req.body;
      const user = await User.findById(userId);
      if(!user){
        return res.status(404).json({message: 'User not found'});
      }
      const updatedUser = await User.findByIdAndUpdate(userId, {
        $pull:{requests:{from:requestId}}
      }, {new:true});
      if(!updatedUser){
        return res.status(404).json({message: 'User not found'});
      }
      await User.findByIdAndUpdate(userId, {
        $push:{friends:requestId}
      });
      const friendUser = await User.findByIdAndUpdate(requestId,{
        $push:{friends:userId}
      });
      if(!friendUser){
        return res.status(404).json({message:"Friend not found"})
  
      }
      res.status(200).json({message:"Request accepted successfully"})
  
  
  
    }catch(error){
      console.log(error);
      res.status(500).json({message:"Server Error"})
    }
  }


  export const getFriends = async(req,res)=>{
    try{
      const userId = req.params.userId;
      console.log(userId)
      const users = await User.findById(userId).populate("friends","username email")
      res.json(users.friends);
  
  
    }catch(error){
      console.log(error)
    }
  }


  export const sendMessage =async (req, res) => {
    try {
      const {senderId, receiverId, message} = req.body;
  
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
      });
  
      await newMessage.save();
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.log('ERROR', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  }


  export const getMessages = async (req, res) => {
    try {
      const {senderId, receiverId} = req.query;
  
      const messages = await Message.find({
        $or: [
          {senderId: senderId, receiverId: receiverId},
          {senderId: receiverId, receiverId: senderId},
        ],
      }).populate('senderId', '_id name');
  
      res.status(200).json(messages);
    } catch (error) {
      console.log('Error', error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  }