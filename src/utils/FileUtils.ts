import { Response } from "express";
import fs from "fs";
import path from "path";

export const sendFile = (pth: string, res: Response) => {
    if (fs.existsSync(`public/${pth}`)) return res.status(200).sendFile(path.join(__dirname, `../../public/${pth}`));
    return res.status(404).json({ error: "Resource not found" });
}

export const uploadFile = async (pth: string, data: string) => {
    const bufferData = Buffer.from(data.split(",")[1], "base64");
    const imagePath = path.join(__dirname, `../../public/${pth}`);

    fs.writeFile(imagePath, bufferData, () => { });
}