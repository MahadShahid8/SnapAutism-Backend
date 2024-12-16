



import { Post } from "../models/post.js"; 
import { User } from "../models/Users.js"; 


//for forum module:
 export const getPosts= async (req, res) => {
    try {
      const posts = await Post.find()
        .populate("userId", "username")
        .populate("replies.user", "username")
        .sort({ createdAt: -1 });
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Error fetching posts" });
    }
  };
  
  
  
  export const createPosts= async (req, res) => {
    try {
        const { content, userId, username } = req.body;
         console.log(username)
        // Check if required fields are provided
        if (!userId || !username || !content) {
            return res.status(400).json({ message: "User ID, username, and content are required." });
        }
  
        const newPostData = {
            userId: userId,
            username: username,
            content: content // No need to check again since we validate it above
        };
  
        const newPost = new Post(newPostData);
        await newPost.save();
  
        res.status(201).json({ message: "Post saved successfully", post: newPost }); // Return the created post
  
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "An error occurred while creating the post." }); // Send an error response
    }
  };
  
  
  
  //endpoint for liking a particular post.
  export const likePosts=async(req,res)=>{
    try{
      const postId = req.params.postId;
      const userId = req.params.userId;
      const post = await Post.findById(postId);
      const updatedPost = await Post.findByIdAndUpdate(postId, {$addToSet:{likes:userId}},
        {new:true}
  
      )
      if(!updatedPost){
        return res.status(404).json({message:"Page not found"})
  
      }
      updatedPost.user = post.user;
      res.json(updatedPost);
  
    }catch(error){
      console.log(error);
  
    }
  }
  //endpoint unliking a post
  export const unlikePosts=async(req,res)=>{
    try{
      const postId = req.params.postId;
      const userId = req.params.userId;
      const post = await Post.findById(postId).populate;
      const updatedPost = await Post.findByIdAndUpdate(postId, {$pull:{likes:userId}},
        {new:true}
  
      )
      updatedPost.user = post.user;
  
      if(!updatedPost){
        return res.status(404).json({message:"Page not found"})
  
      }
      res.json(updatedPost);
  
    }catch(error){
      console.log(error);
  
    }
  }
  
  // Endpoint to add a reply to a post
  export const replyPosts= async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId, content,username } = req.body;
  
      // Find post and user in parallel
      const [post, user] = await Promise.all([
        Post.findById(postId),
        User.findById(userId)
      ]);
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const newReply = {
        user: userId,
        username,
        content: content,
      };
  
      post.replies.push(newReply);
      await post.save();
  
      // Explicitly populate the entire post including the new reply
      const updatedPost = await Post.findById(postId)
        .populate("userId", "username")
        .populate("replies.user", "username");
  
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error adding reply:", error);
      res.status(500).json({ message: "Error adding reply", error: error.message });
    }
  };
  