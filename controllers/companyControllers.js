import companyModel from "../models/companyModel.js"

// CREATE COMPANY
import { v2 as cloudinary } from 'cloudinary';
import redis from "../utils/redis.js";

export const registerCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file; // Provided by multer middleware

        // 1. Validation
        if (!name) {
            return res.status(400).json({
                message: "Company name is required!",
                success: false
            });
        }

        const existingCompany = await companyModel.findOne({ name });
        if (existingCompany) {
            return res.status(400).json({
                message: "Company cannot be registered with the same name!",
                success: false
            });
        }

        // 2. Upload Logo to Cloudinary (if file exists)
        let logoUrl = "";
        if (file) {
            // Convert buffer to base64 or use a stream
            const fileUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: "company_logos", // Optional: organize in Cloudinary
            });
            logoUrl = cloudResponse.secure_url;
        }

        // 3. Save Company to Database
        const company = await companyModel.create({
            name,
            description,
            website,
            location,
            logo: logoUrl, // Save the Cloudinary URL here
            userId: req.user // Ensure your auth middleware populates this
        });
        await redis.del(`company:${req.user}`)
        res.status(201).json({
            success: true,
            message: "Company registered successfully!",
            company
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while creating company...",
            success: false,
            error: error.message
        });
    }
};

export const getCompany= async(req,res) =>{
    const cachedKey = `company:${req.user}`
    try {
        const cachedCompany = await redis.get(cachedKey);
        if (cachedCompany) {
            return res.status(200).json(JSON.parse(cachedCompany))
        }
        
         const company = await companyModel.find({userId:req.user});

         if (!company) {
            return res.status(400).json({msg:"No company Found"})
         }

         const responseData= {
            success:true,message:'ok',company:company
         }
         await redis.set(cachedKey,JSON.stringify(responseData),"EX",3600)
        return res.status(200).json(responseData)
    } 
    catch (error) {
        return res.status(500).json({msg:`${error}`,success:false})
    }
}

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const cachedKey = `company_details:${companyId}`;

        // 1. Check Cache
        const cachedData = await redis.get(cachedKey);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }

        // 2. Database Query
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const responseData = { success: true, company };

        // 3. Store in Redis
        await redis.set(cachedKey, JSON.stringify(responseData), "EX", 3600);

        return res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error", error: error.message });
    }
}
export const companyUpdate = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file; // This will now be available thanks to multer
        const companyId = req.params.id;

        // Create an update object
        const updateData = { name, description, website, location };

        // If a new file is uploaded, handle Cloudinary upload
        if (file) {
            const fileUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
            const cloudResponse = await cloudinary.uploader.upload(fileUri);
            updateData.logo = cloudResponse.secure_url;
        }

        const company = await companyModel.findByIdAndUpdate(
            companyId, 
            updateData, 
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // REDIS: Invalidate cache
        await redis.del(`company:${req.user}`);
        await redis.del(`company_details:${companyId}`);
        await redis.del(`jobs_admin:${req.user}`)
        res.status(200).json({
            success: true,
            message: "Company Updated",
            company
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}