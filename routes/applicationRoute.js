import express from 'express'
import { isAuthenticated } from '../middlewares/middleware.js';
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from '../controllers/applicationControllers.js';

const router = express.Router();

router.route("/applyjob/:id").get(isAuthenticated,applyJob);

router.route("/appliedjob").get(isAuthenticated,getAppliedJobs);

router.route("/:id/applicants").get(isAuthenticated,getApplicants);

router.route("/:id/status").put(isAuthenticated,updateStatus)




export default router;
