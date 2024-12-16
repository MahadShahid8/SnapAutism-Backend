// scheduler/deletePendingRequests.js

import cron from 'node-cron';
import { Consultation } from '../models/ConsultationCall.js'; // Adjust the path as needed
import { Psychologist } from '../models/Psychologist.js';

// Schedule the task to run daily at 00:00 (midnight)
cron.schedule('0 0 * * *', async () => { // Change to run at midnight
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all pending consultations
        const pendingConsultations = await Consultation.find({
            status: 'pending',
        });

        const consultationIds = pendingConsultations.map(consultation => consultation._id);

        // Update Psychologist documents to remove the consultation IDs
        await Psychologist.updateMany(
            { consultations: { $in: consultationIds } }, // Find psychologists with these consultations
            { $pull: { consultations: { $in: consultationIds } } } // Remove those consultation IDs
        );

        // Now delete the pending consultations
        const result = await Consultation.deleteMany({ status: 'pending' });

        console.log(`Deleted ${result.deletedCount} pending consultation request(s) before ${today.toDateString()}`);
    } catch (error) {
        console.error('Error deleting pending consultation requests:', error);
    }
});
