import express from "express"
import { verifyToken } from "../middleware/Verification";
import Validator from "../utils/Validator";
import Guild from "../models/Guild";
import Collection from "../utils/Collection";
import IGuild from "../../interfaces/IGuild";
import WebSocketManager from "../ws/WebSocketManager";
import GuildMember from "../models/GuildMember";

const router = express.Router();

router.use(verifyToken);

router.post("/", (req, res) => {
    Validator.validateGuildCreate().validate(req.body).then(() => {
        const guild = new Guild({ name: req.body.name, ownerId: (req as any).user.id });
        const guildMember = new GuildMember({ user: (req as any).user._id, guildId: guild._id })

        guild.members.push(guildMember._id);

        if (req.body.icon) {
            fetch(`http://localhost:3002/guild/${Buffer.from(guild._id).toString("base64url")}.png`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${req.get("Authorization")}`
                },
                body: JSON.stringify({
                    data: req.body.icon.split(",")[1]
                })
            }).then(() => {
                guild.icon = `${Buffer.from(guild._id).toString("base64url")}.png`;
                createGuildChannels(guild).then(() => {
                    guild.save().then(() => {
                        (req as any).user.guilds.push(guild._id);
                        (req as any).user.save().then(async () => {
                            await guildMember.save();
                            res.status(200).json({ guild });
                            WebSocketManager.send((req as any).user._id, { eventType: "GuildCreate", data: { guild: await guild.populate(["channels", "members"]) } });
                        });
                    });
                });
            });
            return;
        }

        createGuildChannels(guild).then(() => {
            guild.save().then(() => {
                (req as any).user.guilds.push(guild._id);
                (req as any).user.save().then(async () => {
                    await guildMember.save();
                    res.status(200).json({ guild });
                    WebSocketManager.send((req as any).user._id, { eventType: "GuildCreate", data: { guild: await guild.populate(["channels", "members"]) } });
                });
            });
        });
    }).catch((err: any) => res.status(400).json({ error: err.message }));
});

router.delete("/:guildId", verifyToken, (req: any, res) => {
    Collection.guilds.get(req.params.guildId).then(async (guild) => {
        if (!guild) return res.status(404).json({ error: "Guild not found" });
        if (req.user._id !== guild.ownerId) return res.status(403).json({ error: "You are not the owner of this guild" });

        guild.channels.forEach((channel) => {
            if (typeof channel === "string") Collection.channels.delete(channel)
        });

        await GuildMember.deleteMany({ guildId: guild._id });
        guild?.deleteOne();
        WebSocketManager.broadcast({ eventType: "GuildDelete", data: guild });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    })
})

const createGuildChannels = (guild: IGuild) => {
    const channelPromises = [
        Collection.channels.create({
            name: "general",
            type: 0,
            guildId: guild._id,
            position: 0,
        }),
        Collection.channels.create({
            name: "General",
            type: 1,
            guildId: guild._id,
            members: [],
            position: 1,
        }),
    ];

    return Promise.all(channelPromises).then((channels) => {
        guild.channels.push(...channels.map((channel) => channel._id) as any);
    });
};


export default router;