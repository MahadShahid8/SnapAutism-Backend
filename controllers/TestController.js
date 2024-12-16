
import {Child} from '../models/Child.js'
import {Test} from '../models/Test.js'
import {User} from '../models/Users.js'


//test create controller
export const takeTest =async (req, res) => {
    
    
    const childId = req.params.childId
    const {testName,dateTaken} = req.body
    const result=0
  
    try{
    
    const child = await Child.findById(childId)
  
    if(!child)
    {
      return res.status(400).json({ error: 'Child not found' });
    }
    else 
    {
      const newtest = new Test({
        testName,
        dateTaken,
        
      
    }); 
    

    const savedtest = await newtest.save();
    
  
    // Add the new child's ID to the user's list of children
    child.tests.push(savedtest._id);
    await child.save();
  
    // Respond with success
    return res.status(201).json({ message: "test added successfully", test: savedtest });
    }
  }
  catch(error)
  {
    return res.status(500).json({ error: "An error occurred while adding the test" });
  }
  
  
}










//test delete controller
export const deleteTest = async (req, res) => {
    console.log("Deleting test and associated references");
  
    const { testId, childId } = req.params;
  
    try {
      // Validate ObjectId format
     
  
      // Find the child by ID and populate the tests field
      const child = await Child.findById(childId).populate('tests');
      if (!child) {
        return res.status(404).json({ error: 'Child not found' });
      }
  
      // Find the test by ID
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
  
      // Remove the test ID from the child's tests array
      child.tests = child.tests.filter(test => test._id.toString() !== testId);
      await child.save();
  
      // Delete the test document
      await Test.findByIdAndDelete(testId);
  
      // Respond with success
      return res.status(200).json({ message: 'Test and associated references deleted successfully' });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while deleting the test' });
    }
  };




  export const userTestHistory = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId).populate('children');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const childrenIds = user.children.map(child => child._id);
  
      const childrenWithTests = await Child.find({ _id: { $in: childrenIds } })
        .populate({
          path: 'tests',
          model: 'Test',
        });
  
      const testHistory = childrenWithTests.reduce((acc, child) => {
        if (child.tests && child.tests.length > 0) {
          child.tests.forEach(test => {
            acc.push({
              childAge: child.age,
              testName: test.testName || 'N/A',
              testDate: test.dateTaken || 'N/A',
              testResult: test.result,
              autism_probability: test.autism_probability,
              risk_level: test.risk_level,
              testResponses: test.userResponses || {},
            });
          });
        }
        return acc;
      }, []);
  
      return res.status(200).json(testHistory);
    } catch (error) {
      console.error('Error fetching test history:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  export const updateTest = async (req, res) => {
    try {
      const { testId } = req.params;
      const { status, result, autism_probability, risk_level, normalAnswersArray } = req.body;
  
      // Validate status value
      const validStatuses = ['complete', 'incomplete'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      // Find the test by ID and update it
      const updatedTest = await Test.findByIdAndUpdate(
        testId, 
        { 
          userResponses: normalAnswersArray, 
          status, 
          result,
          autism_probability,
          risk_level
        },
        { new: true, runValidators: true }
      );
  
      if (!updatedTest) {
        return res.status(404).json({ message: 'Test not found' });
      }
  
      return res.status(200).json(updatedTest);
    } catch (error) {
      console.error('Error updating test:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
