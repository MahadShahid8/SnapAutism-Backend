
import express from 'express'

import {getPosts,createPosts,likePosts,unlikePosts,replyPosts} from "../controllers/ForumController.js"
const router = express.Router();




//for forum module:
router.get("/get-posts", getPosts);
  
  
router.post("/create-post", createPosts);
  
  
  
//endpoint for liking a particular post.
router.put("/posts/:postId/:userId/like",likePosts)
//endpoint unliking a post
router.put("/posts/:postId/:userId/unlike",unlikePosts)
  
// Endpoint to add a reply to a post
router.post("/posts/:postId/reply", replyPosts);
 


export {router as ForumRouter}