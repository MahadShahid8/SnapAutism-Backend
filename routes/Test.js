import express from "express";
const router = express.Router();


import {takeTest,deleteTest,updateTest} from "../controllers/TestController.js"



router.get("/take", (req, res) => {
  res.json({
    message: "test started",
  });
});


router.post("/:childId/taketest",takeTest) 
router.delete("/:childId/:testId/deleteTest",deleteTest) 
router.put("/:testId/updateTest",updateTest)
//router.post("/:testId/addResponse",addResponse)


export { router as TestRouter };
