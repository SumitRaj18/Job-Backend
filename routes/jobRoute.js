import express from "express"
import { postJob,getAllJobs,getJobById, getOneJob } 
from "../controllers/jobControllers.js"
import { isAuthenticated } from "../middlewares/middleware.js"
const router =  express.Router()
// API
// POST | http://localhost:5000/api/v1/job/add
router.route("/add").post(isAuthenticated,postJob)
router.route("/all").get(getAllJobs);
router.route("/explore/:id").get(getOneJob);
router.route("/adminjobs").get(isAuthenticated,getJobById)
export default router


