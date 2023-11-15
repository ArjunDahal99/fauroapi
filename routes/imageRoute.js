import express from "express";
import { generateImage, getAllImage } from "../controllers/generateContoller.js";


const router = express.Router();

router.post("/generate", generateImage);
router.get("/get-all-image", getAllImage);

export default router;
