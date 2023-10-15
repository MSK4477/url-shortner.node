import express from "express"
import cors from "cors"
import dbToConnect from "./database/mongoose_connection.js"
import cookieParser from "cookie-parser"
import userRouter from "./router/user.js"
import urlRouter from "./router/url.js"

await dbToConnect()

const app = express()

app.use(express.json())
app.use(cookieParser());

app.use(cors({
    origin: "https://resplendent-cupcake-505e71.netlify.app",
    credentials: true,
  }))

app.get("/", (req, res) =>{
    res.status(200).json({message:"welcome"})
})

app.use("/api/users", userRouter);
app.use("/api/url", urlRouter);

const PORT =  3001

app.listen(PORT, () =>{
    console.log("server listening on port", PORT);
})