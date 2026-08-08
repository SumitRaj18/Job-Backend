import express from "express"
import "dotenv/config"
import chalk from "chalk"
import connectDB from "./config/config.js"
import cookieParser from "cookie-parser"
import  userRoutes from "./routes/userRoute.js"
import companyRoutes from "./routes/companyRoute.js"
import jobRoutes from "./routes/jobRoute.js"
import applicationRoutes from './routes/applicationRoute.js'
import cors from 'cors'

// INSTANCE OF EXPRESS
const app = express()
//PORT
const port = process.env.PORT
//DB SERVER
connectDB()
// MIDDLEWARES
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: 'https://jobportal-by-sumit.netlify.app', // Must match your React URL exactly
    credentials: true   ,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']             // Allows the browser to store the cookie
}))
app.set("json spaces",2)
app.use(cookieParser())
// ROUTES MIDDLEWARE
// http://localhost:5000/api/v1/users
app.use("/api/v1/users",userRoutes)
// http://localhost:5000/api/v1/company
app.use("/api/v1/company",companyRoutes)

app.use("/api/v1/job",jobRoutes);

app.use("/api/v1/application",applicationRoutes)

app.get("/health",(req,res)=>{
    res.status(200).send("Ok")
})

app.listen(port,
    ()=>console.log(chalk.yellow(`Server running at http://localhost:${port}`)))