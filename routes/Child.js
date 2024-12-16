

import express from 'express'







import {addChild,viewChildren,deleteChild,viewChild} from "../controllers/ChildControllers.js"
const router = express.Router();





router.post('/:userId/add',addChild)
router.get('/:userId/viewChildren',viewChildren)
router.delete("/:userId/children/:childId/deleteChild",deleteChild)
router.get("/:childId",viewChild)




export {router as ChildRouter}