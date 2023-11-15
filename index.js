import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Imagerouter from "./routes/imageRoute.js";
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "*",
  })
);
app.use("/api/", Imagerouter);

app.listen(PORT, () =>
{
  console.log(`server started at ok do
   ${PORT}`);
});
