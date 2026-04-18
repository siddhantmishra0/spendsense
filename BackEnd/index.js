import dotenv from "dotenv"
import connectDB from "./src/db/index.js"
import { app } from "./src/app.js"
// import cors from "cors"
import mongoose from "mongoose"
// import UserModel from "./models/user.model.js"
dotenv.config({
  path: "./.env"
})
// const app = express()
connectDB()
.then(()=>{
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on port ${process.env.PORT}`)
  })
})
.catch((err)=>{
  console.log("MongoDB connection failed! ",err)
})

// import { MongoClient } from "mongodb"
// MongoClient.connect(process.env.MONGODB_URL)
// .then(() => console.log('Connected!')).catch(err => console.error(err.message))

// if (!process.env.MONGODB_URL) {
//   throw new Error("MONGODB_URL is not defined in environment variables");
// }
// mongoose.connect(process.env.MONGODB_URL)