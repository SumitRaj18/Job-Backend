import mongoose from "mongoose";
import chalk from "chalk"
import "dotenv/config"

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        if (conn) {
            console.log(chalk.magenta(`Connected to db server!!`))
        }
        else {
            console.log("Error in db connection!!")
        }
    } catch (error) {
        console.log(error)
    }
}

export default connectDB;
