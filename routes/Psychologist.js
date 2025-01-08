import express from "express";


//
import jwt from 'jsonwebtoken'
const router = express.Router();


//controller imports
import  {signup,login,forgotPassword,resetPassword,profile,logout,viewCallRequests,confirmConsultationRequest,viewPsychologistProfile,setPsychologistProfile,updateAvailability,verifyCode,ReportConsultations} from '../controllers/PsychologistControllers.js'; // Controller functions



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

router.use(express.json());
  

//account creation 
router.post('/signup', signup);
router.post('/verify', verifyCode);
router.post('/login', login);
router.post('/logout',logout)
router.post('/forgotpassword', forgotPassword)
router.post('/resetPassword/:token', resetPassword)
router.get('/profile', authenticateJWT, profile);


//for psychologist profile
router.get('/:psychologistId/getProfile',viewPsychologistProfile)
router.put('/:psychologistId/setProfile',setPsychologistProfile)

//updated availability when a user books a time slot
router.patch('/:psychologistId/updateAvailability', updateAvailability);

//for consultation
router.get('/:psychologistId/AllConsultations',viewCallRequests)
router.get('/:psychologistId/ReportConsultations',ReportConsultations)

router.post('/:consultationId/confirmConsultationRequest',confirmConsultationRequest)


export {router as PsychologistRouter}
export default authenticateJWT;