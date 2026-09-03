import jobModel from "../models/jobModel.js"
import redis from "../utils/redis.js"
// job posted by an admin
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } = req.body;
        console.log(req.body)
        // Ensure you are getting the ID correctly (check your isAuthenticated middleware)
        const adminId = req.id || req.user?._id || req.user; 

        if (!title || !description || !requirements || !salary || !location || !jobType || !experienceLevel || !position || !companyId) {
            return res.status(400).json({ message: "Something is missing.", success: false });
        };

        const job = await jobModel.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel,
            position,
            companyId,
            created_by: adminId // Mongoose will handle the casting if this is a valid ID string
        });

        // --- REDIS CACHE INVALIDATION ---
        // Convert adminId to string to ensure the key is consistent
        const cacheKey = `jobs_admin:${adminId.toString()}`;
        
        // Use the correct client name (check if you exported as 'redis' or 'redisClient')
        await redis.del(cacheKey); 

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Error in postJob:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// for student all jobs
// Backend: job.controller.js
// controllers/job.controller.js

// GET ALL JOBS (Student)
export const getAllJobs = async (req, res) => {
    const { location, role, salary } = req.query;
    
    // Pattern: jobs:list:location:role:salary
    const cachedKey = `jobs:list:${location || 'all'}:${role || 'all'}:${salary || 'all'}`;

    try {
        const cachedData = await redis.get(cachedKey);
        if (cachedData) return res.status(200).json(JSON.parse(cachedData));

        let query = {};
        if (location) query.location = { $regex: location, $options: "i" };
        if (role) query.title = { $regex: role, $options: "i" };
        
        // Ensure salary is a Number in your Schema
        if (salary === "0-40k") query.salary = { $lte: 40000 };
        else if (salary === "42k-1lakh") query.salary = { $gte: 42000, $lte: 100000 };

        const jobs = await jobModel.find(query)
            .populate("companyId")
            .populate("applications")
             // Needed for 'Already Applied' status
            .sort({ createdAt: -1 });

        const responseData = { success: true, jobs };
        await redis.set(cachedKey, JSON.stringify(responseData), "EX", 3600);

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET SINGLE JOB
export const getOneJob = async (req, res) => {
    try {
        const id = req.params.id;
        const cachedKey = `jobs:single:${id}`; // Unified prefix

        const cachedJob = await redis.get(cachedKey);
        if (cachedJob) return res.status(200).json(JSON.parse(cachedJob));

        const job = await jobModel.findById(id)
            .populate("companyId")
            .populate("applications");

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const responseData = { success: true, job };
        await redis.set(cachedKey, JSON.stringify(responseData), "EX", 3600);

        return res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ success: false });
    }
};
// get all Admin jobs by id
export const getJobById = async (req, res) => {
    try {
        const adminId = req.user; // Using req.id from your auth middleware
        const cacheKey = `jobs_admin:${adminId}`;

        // 1. Try to fetch from Redis
        const cachedJobs = await redis.get(cacheKey);

        if (cachedJobs) {
            return res.status(200).json({
                success: true,
                message: "Fetched from cache",
                jobs: JSON.parse(cachedJobs)
            });
        }

        // 2. Cache Miss - Query MongoDB
        const jobs = await jobModel.find({ created_by: adminId })
            .populate("companyId")
            .sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No jobs found!"
            });
        }

        // 3. Store in Redis (Expire in 10 minutes - 600 seconds)
        // We set it slightly shorter than your 15-min JWT for freshness
        await redis.set(cacheKey, JSON.stringify(jobs),"EX","3600");

        return res.status(200).json({
            success: true,
            jobs
        });

    } catch (error) {
        console.error("Redis/DB Error:", error);
        res.status(500).json({
            success: false,
            message: "Error while getting jobs...",
            error: error.message
        });
    }
};