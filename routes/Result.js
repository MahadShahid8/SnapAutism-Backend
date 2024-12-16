import express from "express";
const router = express.Router();

import { Test } from "../models/Test.js";

router.post("/:testId/submit", async (req, res) => {
    const testId = req.params
  const { responses, score } = req.body;

  try {
    const { childId } = req.params;

    if (!childId) {
      console.log("user not found");
    }

    const child = await Child.find({ childId: childId });

    const test = new Test({
      testName,
      score,
      dateTaken,
      childId,
    });
    await test.save();

    // Respond with success
    return res
      .status(200)
      .json({ message: "Child added successfully", test: test });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the child" });
  }
});

export { router as TestRouter };



//ther will be an api call in the middle before this api call, that will give the responses formthe user to the ml model, and take the score form there,
//now these responses and the score will be posted in this api.


//work on the folder structure, ML integration, and redux(api calls in redux)
