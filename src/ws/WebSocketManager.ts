import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { verifyTokenForWS } from "../middleware/Verification";
import OpCodes from "../constants/OpCodes";
import StatusCodes from "../constants/StatusCodes";
import IUser from "../../interfaces/IUser";
import { Document } from "mongoose";

export default class WebSocketManager {

    wss: WebSocketServer;
    heartbeatInterval = 45000;
    static clients: Map<WebSocket, any> = new Map();
    static users: Map<string, { ws: WebSocket, instance: Document<unknown, {}, IUser> & IUser & Required<{ _id: string; }> }> = new Map();
    clientHeartbeats: Map<WebSocket, NodeJS.Timeout> = new Map();

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });
        this.handleEvents();
    }

    private handleEvents() {
        this.wss.on("connection", (ws, request) => {
            const heartbeatTimer = setInterval(() => {
                ws.close(StatusCodes.CLOSE.SESSION_TIMEOUT.CODE, StatusCodes.CLOSE.SESSION_TIMEOUT.ERROR);
            }, this.heartbeatInterval * 2);
            this.clientHeartbeats.set(ws as WebSocket, heartbeatTimer);

            ws.send(JSON.stringify({
                op: OpCodes.HELLO,
                data: {
                    heartbeatInterval: this.heartbeatInterval
                }
            }));

            ws.on("message", (data) => {
                const payload = JSON.parse(data.toString());
                switch (payload.op) {
                    case OpCodes.HEARTBEAT:
                        if (this.clientHeartbeats.has(ws)) {
                            const timer = this.clientHeartbeats.get(ws);
                            if (timer) {
                                clearTimeout(timer);
                                const newHeartbeatTimer = setInterval(() => {
                                    ws.close(StatusCodes.CLOSE.SESSION_TIMEOUT.CODE, StatusCodes.CLOSE.SESSION_TIMEOUT.ERROR);
                                }, this.heartbeatInterval * 2);
                                this.clientHeartbeats.set(ws, newHeartbeatTimer);
                            }
                        }
                        break;
                    case OpCodes.IDENTIFY:
                        verifyTokenForWS(ws, payload.data.token, (user) => {
                            WebSocketManager.clients.set(ws, user);
                            WebSocketManager.users.set(user._id, { ws: ws, instance: user });
                            user.status = "online";
                            user.save();
                            ws.send(JSON.stringify({
                                op: OpCodes.DISPATCH,
                                eventType: "Ready",
                                data: { user }
                            }))
                        })
                        break;
                }
            });

            ws.on("close", () => {
                if (this.clientHeartbeats.has(ws)) {
                    const timer = this.clientHeartbeats.get(ws);
                    if (timer) {
                        clearTimeout(timer);

                        const user = WebSocketManager.clients.get(ws);

                        if (user) {
                            user.status = "offline";
                            user.save();
                        }

                        this.clientHeartbeats?.delete(ws);
                        WebSocketManager.users.delete(user?._id);
                        WebSocketManager.clients.delete(ws);
                    }
                }
            })
        })
    }

    public static broadcast(data: any) {
        const eventData = JSON.stringify({
            op: OpCodes.DISPATCH,
            ...data
        });

        this.clients.forEach((userSocket, ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(eventData);
            }
        });
    }

    public static send(id: string, data: any) {
        const eventData = JSON.stringify({
            op: OpCodes.DISPATCH,
            ...data
        });

        const user = WebSocketManager.users.get(id);

        if (user) {
            if (user.ws.readyState === WebSocket.OPEN) {
                user.ws.send(eventData);
            }
        }
    }
}