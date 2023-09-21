import express from "express"
import cors from "cors"
import userRouter from "./router/user.js"
import urlRouter from "./router/url.js"
import dbToConnect from "./database/mongoose_connection.js"
const app = express()
app.use(express.json())
app.use(cors())
await dbToConnect()
const corsOptions = {
    origin: 'http://localhost:5173', 
  };
  
  app.use(cors(corsOptions));

app.use("/api/users", userRouter)
app.use("/api/url", urlRouter)
const PORT = 3000


app.get("/", (req, res) =>{
    res.status(200).json({message:"welcome"})
})

app.listen(PORT, () =>{
    console.log("server listening on port", PORT);
})