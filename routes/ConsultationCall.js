import express from 'express';
import multer from 'multer';
import path from 'path'; // Import path module
import { requestConsultation,viewConsultationRequests,getAllPsychologists,confirmMeetingCompletionByPsychologist,submitConsultationRating } from "../controllers/ConsultationController.js";

const router = express.Router();

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // Custom filename
  },
});

// Initialize upload with multer
const upload = multer({ storage });

router.post('/:psychologistId/consultationRequest', requestConsultation);

router.get('/:userId/viewConsultationRequests',viewConsultationRequests)




router.get('/getAllPsychologists',getAllPsychologists)
router.put('/:consultationId/psychologistMeetingCompleted',confirmMeetingCompletionByPsychologist)
router.put('/:consultationId/submitReview',submitConsultationRating)

export { router as ConsultationRouter };
