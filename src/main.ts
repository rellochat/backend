import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import WebSocketManager from "./ws/WebSocketManager";

const app = express();

dotenv.config();

app.use('/img', express.static(path.join(__dirname, 'public/images')));
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).send("Hello World!");
});

const routes = fs.readdirSync("src/routes");

for (const route of routes) {
    app.use(`/${route.replace(".ts", "")}`, require(`./routes/${route}`).default);
}

const server = app.listen(process.env.API_URL?.split(":")[2], () => {
    mongoose.connect(process.env.MONGO_URI!).then(() => console.log("Connected to MongoDB!")).catch((err) => console.trace(err));
    console.log(`Listening on port ${process.env.API_URL?.split(":")[2]}!`);
});

new WebSocketManager(server);