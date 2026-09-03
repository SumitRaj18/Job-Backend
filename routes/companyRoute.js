import express from "express"
import { companyUpdate, getCompany, getCompanyById, registerCompany } from "../controllers/companyControllers.js"
import { isAuthenticated } from "../middlewares/middleware.js"
import { singleUpload } from "../config/multer.js";


const router = express.Router()
// API
// POST | http://localhost:5000/api/v1/company/create
router.route("/create").post(isAuthenticated,singleUpload,registerCompany)

router.route("/all").get(isAuthenticated,getCompany)

router.route("/:id").get(isAuthenticated,getCompanyById)

router.route("/update/:id").put(isAuthenticated,singleUpload,companyUpdate)




export default router