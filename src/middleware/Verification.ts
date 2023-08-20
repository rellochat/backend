import { NextFunction, Request, Response } from "express";
import Generator from "../utils/Generator";
import Collection from "../utils/Collection";
import WebSocket from "ws";
import IUser from "../../interfaces/IUser";
import StatusCodes from "../constants/StatusCodes";
import { Document } from "mongoose";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.get("Authorization");
    if (typeof token !== "string") return res.status(401).json({ error: "Access Denied" });
    const parts = Generator.generateDataFromToken(token!);

    Collection.users.get(parts._id!).then((user) => {
        if (!user
            || parts.lastLogin!.getTime() - 2000 > user.lastLogin.getTime() || parts.lastLogin!.getTime() + 2000 < user.lastLogin.getTime()
            || parts.secret !== user.secret) return res.status(401).json({ error: "Access Denied" });

        (req as any).user = user;
        next();
    }).catch((err) => {
        res.status(500).json({ error: "Something went wrong. Please try again." });
    })
}

export const verifyTokenForWS = (ws: WebSocket, token: string, callback: (user: Document<unknown, {}, IUser> & IUser & Required<{ _id: string; }>) => void) => {
    if(!token) return ws.close(StatusCodes.CLOSE.UNKNOWN_ERROR.CODE, StatusCodes.CLOSE.UNKNOWN_ERROR.ERROR);
    const parts = Generator.generateDataFromToken(token);
    Collection.users.get(parts._id!).then((user) => {
        if (!user
            || parts.lastLogin!.getTime() - 2000 > user.lastLogin.getTime() || parts.lastLogin!.getTime() + 2000 < user.lastLogin.getTime()
            || parts.secret !== user.secret) return ws.close(StatusCodes.CLOSE.AUTH_FAILED.CODE, StatusCodes.CLOSE.AUTH_FAILED.ERROR);
        callback(user);
    }).catch((err) => {
        console.trace(err);
        ws.close(StatusCodes.CLOSE.UNKNOWN_ERROR.CODE, StatusCodes.CLOSE.UNKNOWN_ERROR.ERROR)
    })
}