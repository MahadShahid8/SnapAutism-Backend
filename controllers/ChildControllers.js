
import {User} from '../models/Users.js'
import {Child} from '../models/Child.js'



//Add child
export const addChild = async (req, res) => {
    console.log("Child add post request");
  
    const { userId } = req.params;
    const { childName, age ,ageUnit} = req.body;
  
    try {
      // Validate input
      if (!childName || !age) {
        return res.status(400).json({ error: 'Child name and age are required' });
      }
  
      // Find user by ID and populate children field
      const user = await User.findById(userId).populate('children');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      
      
      // Check if a child with the same name and age already exists for this user
      const existingChild =  user.children.find(child => 
        child.name === childName && child.age === age
      );
  
      if (existingChild) {
        console.log('Child already exists:', existingChild);
        return res.status(400).json({ error: 'Child already exists for this user' });
      }
  
      // Create and save a new child object
      const newChild = new Child({
        name: childName,
        age,
        ageUnit
      });
  
      const savedChild = await newChild.save();
  
      // Add the new child's ID to the user's list of children
      user.children.push(savedChild._id);
      await user.save();
  
      // Respond with success
      return res.status(201).json({ message: "Child added successfully", child: savedChild });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while adding the child' });
    }
  };
  
  



//view Children
export const viewChildren = async (req, res) => {
    console.log("in view children");
  
    try {
      const { userId } = req.params;
  
      // Find the logged-in user by ID
      const user = await User.findById(userId).populate('children');; // Ensure req.user._id is correct
      if (!user) {
        // If the user is not found, send a response and return early
        return res.status(404).json({ error: "User not found" });
      }
  
      // Find children associated with the user
      const children = await user.children
  
      // Send the response with the user and their children
      return res.status(200).json({ children ,user});
  
    } catch (error) {
      console.error(error);
      // Send error response
      return res.status(500).json({ error: "An error occurred while retrieving the children" });
    }
  };




  //child delete controller
  export const deleteChild = async (req, res) => {
    console.log("in delete child");
  
    try {
      const { userId, childId } = req.params; // Get both userId and childId from params
     
      // Find the logged-in user by ID and populate the children field
      const user = await User.findById(userId).populate('children');
      

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Find the child by ID
      const child = await Child.findById(childId);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
  
      // Remove the child's ID from the user's list of children
      user.children = user.children.filter(children =>children._id.toString() !== childId);
      await user.save();
  
      // Delete the child object
      await Child.findByIdAndDelete(childId);
  
      // Optional: Delete any associated data (e.g., tests)
      // Example:
      // await Test.deleteMany({ childId: childId });
  
      // Respond with success
      return res.status(200).json({ message: "Child and associated references deleted successfully" });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "An error occurred while deleting the child" });
    }
  };
  

  //view Single child controller
 

export const viewChild = async (req, res) => {
  const { childId } = req.params; 
  

  try {
    
    if (!childId) {
      return res.status(400).json({ message: 'Child ID is required' });
    }

    // Fetch the child from the database
    const child = await Child.findById(childId);

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    console.log(child)
    res.status(200).json(child);
  } catch (error) {
    console.error('Error fetching child details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


  