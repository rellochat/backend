import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { verifyTokenForWS } from "../middleware/Verification";
import OpCodes from "../constants/OpCodes";
import StatusCodes from "../constants/StatusCodes";

export default class WebSocketManager {

    wss: WebSocketServer;
    heartbeatInterval = 45000;
    clients: Map<string, any> = new Map();
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
                    case 1:
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
                    case 2:
                        verifyTokenForWS(ws, payload.data.token, (user) => {
                            this.clients.set(user.id, user);
                        })
                        break;
                }
            });

            ws.on("close", () => {
                if (this.clientHeartbeats.has(ws)) {
                    const timer = this.clientHeartbeats.get(ws);
                    if (timer) {
                        clearTimeout(timer);
                        this.clientHeartbeats.delete(ws);
                    }
                }
            })
        })
    }
}