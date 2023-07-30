import express from "express";
import { verifyToken } from "../middleware/Verification";
import { sendFile } from "../utils/FileUtils";
const router = express.Router();

router.get("/images/:path", (req, res) => {
    sendFile(`images/${req.params.path}`, res);
});

router.get("/images/guild/:path", (req, res) => {
    sendFile(`images/guild/${req.params.path}`, res);
});

router.get("/images/avatar/:path", (req, res) => {
    sendFile(`images/avatar/${req.params.path}`, res);
});

router.post("/images/avatar", verifyToken, (req, res) => {
    
})

router.use((req, res) => {
    res.status(404).json({ error: "Resource not found" });
})

export default router;