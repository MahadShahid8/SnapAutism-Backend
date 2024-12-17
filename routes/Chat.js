import express from 'express';
import {
  getAllUsers,
  getUserWithFriends,
  getUserById,
  sendRequest,
  getAllRequests,
  acceptRequest,
  getFriends,
  sendMessage,
  getMessages
} from "../controllers/ChatController.js";

const router = express.Router();

// User management routes
router.get('/users/:userId', getAllUsers);         // Get all users except friends
router.get('/user/:userId', getUserById);          // Get single user details
router.get('/friends/:userId', getFriends);        // Get user's friends list

// Request management routes
router.post('/sendrequest', sendRequest);          // Send friend request
router.get('/getrequests/:userId', getAllRequests); // Get pending requests
router.post('/acceptrequest', acceptRequest);       // Accept friend request

// Message management routes
router.post('/sendMessage', sendMessage);
router.get('/messages', getMessages);

export { router as ChatRouter };