import express from "express";
import bcrypt from 'bcrypt';

import cors from 'cors';

import {User} from '../models/Users.js'

//
import nodemailer from 'nodemailer';

//
import jwt from 'jsonwebtoken'
const router = express.Router();


//controller imports
import  {signup,login,forgotPassword,resetPassword,profile,logout,verifyCode} from '../controllers/AuthControllers.js'; // Controller functions
import {userTestHistory} from '../controllers/TestController.js'


// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Check cookie or Authorization header

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.KEY, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
};

  
  


router.post('/verify', verifyCode);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout',logout)
router.post('/forgotpassword', forgotPassword)
router.post('/resetPassword', resetPassword)
router.get('/profile', authenticateJWT, profile);

router.get('/:userId/test-history',userTestHistory)



export {router as UserRouter}
export default authenticateJWT;