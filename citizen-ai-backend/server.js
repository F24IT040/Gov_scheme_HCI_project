import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/chat",chatRoute);

const port = process.env.PORT || 5000;

app.listen(port,()=>{
    console.log("Server Running");
});