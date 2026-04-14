import express from "express"
import { login, logout, register,updateProfile } 
from "../controllers/userControllers.js"
import { isAuthenticated } from "../middlewares/middleware.js"
import { profileUpload, singleUpload } from "../config/multer.js"
//ROUTER INSTANCE
const router = express.Router()
// API |  http://localhost:5000/api/v1/users/register

router.route("/register").post(singleUpload,register)

// http://localhost:5000/api/v1/users/login

router.route("/login").post(login)

// http://localhost:5000/api/v1/users/logout

router.route("/logout").post(logout)

// http://localhost:5000/api/v1/users/profile

router.route("/profile").put(isAuthenticated,profileUpload,updateProfile)

export default router