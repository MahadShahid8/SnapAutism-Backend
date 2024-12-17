import express from 'express';
import {
    getPosts,
    createPosts,
    likePosts,
    unlikePosts,
    replyPosts
} from "../controllers/ForumController.js";

const router = express.Router();

// Base route prefix is /forum
router.get("/get-posts", getPosts);
router.post("/create-post", createPosts);
router.put("/posts/:postId/:userId/like", likePosts);
router.put("/posts/:postId/:userId/unlike", unlikePosts);
router.post("/posts/:postId/reply", replyPosts);

export { router as ForumRouter };