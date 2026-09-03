import jwt from "jsonwebtoken"
import "dotenv/config"

// IS AUTHENTICATED
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(401).json({ message: "Token not provided!", success: false })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        // console.log(decoded)
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token!", success: false })
        }
        req.user = decoded._id
        next()          

    } catch (error) {
        return res.status(401).json({
            message: "Authentication failed",
            success: false
        });

    }
}