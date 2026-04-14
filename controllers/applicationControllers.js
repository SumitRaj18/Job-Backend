import applicationModel from "../models/applicationModel.js";
import jobModel from "../models/jobModel.js";
import redis from "../utils/redis.js";

// controllers/application.controller.js
export const applyJob = async (req, res) => {
    try {
        const userId = req.user; 
        const jobId = req.params.id;

        if (!jobId) return res.status(400).json({ message: "Job id is required", success: false });

        // 1. Check if already applied
        const existingApplication = await applicationModel.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job", success: false });
        }

        // 2. Check if job exists
        const job = await jobModel.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found", success: false });

        // 3. Create Application
        const newApplication = await applicationModel.create({
            job: jobId,
            applicant: userId
        });

        // 4. Update Job Model
       // 4. Update Job Model
        job.applications.push(newApplication._id);
        await job.save();

        // --- UNIFIED REDIS CACHE INVALIDATION ---
        try {
            // 1. Clear all job list variations (Home/Explore)
            const jobListKeys = await redis.keys("jobs:*");
            if (jobListKeys.length > 0) await redis.del(jobListKeys);

            // 2. Clear specific job detail and user's applied list
            // We use Promise.all to delete these in parallel (faster)
            await Promise.all([
                redis.del(`job:${jobId}`),
                redis.del(`appliedJob:${userId}`)
            ]);
        } catch (redisError) {
            console.error("Redis Invalidation Error:", redisError);
            // We don't block the response if Redis fails
        }

        return res.status(201).json({
            message: "Job applied Successfully",
            success: true,
            application: newApplication
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error while applying" });
    }
};

export const getAppliedJobs= async (req,res) => {
    const cachedKey = `appliedJob:${req.user}`
    try {
       const cachedJob = await redis.get(cachedKey);
       if (cachedJob) {
        return res.status(200).json(JSON.parse(cachedJob))
       }
        const userId = req.user;
        const applications = await applicationModel.find({applicant:userId})
        .sort({createdAt:-1})
        .populate({
            path:'job',
            options:{
                createdAt: -1
            },
            populate:{
                path:"companyId",
                options:{
                createdAt: -1
            }
            }
        })

        if (!applications) {
            return res.status(404).json({
                success:false,
                message:"No jobs applied"
            })
        }
        const responseData= {
            success:true,
            applications
        }
        await redis.set(cachedKey,JSON.stringify(responseData),'EX',3600)
        res.status(200).json(responseData)

    } catch (error) {
       res.status(500).json({
        success:false,
        message:"Getting Error",
        error
       })
    }
}

export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await jobModel.findById(jobId)
        .populate({
            path:"applications",
            sort:{createdAt: -1},
            populate:{
                path:"applicant"
            }
        })
        return res.status(200).json({
            success:true,
            job
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error"
        })
    }
}

export const updateStatus = async (req,res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        console.log("Application Id:",id)
        const application = await applicationModel.findOne({ _id:id })
        console.log("Database result:", application);

        if (!status) {
            return res.status(404).json({message:"Status not found!"})
        }
        if (!application) {
           return res.status(404).json({message:"Application not found!"}) 
        }
        application.status = status.toLowerCase();
        await application.save()
        res.status(201).json({
            success:true,
            message:"Status updated Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error while updating status",
            error
        })
    }
}