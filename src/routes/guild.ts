import express from "express"
import { verifyToken } from "../middleware/Verification";
import Validator from "../utils/Validator";
import Guild from "../models/Guild";
import Collection from "../utils/Collection";

const router = express.Router();

router.use(verifyToken);

router.post("/", (req, res) => {
    Validator.validateGuildCreate().validate(req.body).then(() => {
        const guild = new Guild({ name: req.body.name, ownerId: (req as any).user.id });

        // if (req.body.icon) {
        //     uploadFile(`${Buffer.from(guild._id).toString("base64url")}`, req.body.icon).then(() => {
        //         guild.icon = `${Generator.base64UrlEncode(guild._id)}.png`;
        //         guild.save().then(() => {
        //             Collection.channels.create({ name: "General", type: 0, guildId: guild._id, position: 0 });
        //             Collection.channels.create({ name: "General", type: 1, guildId: guild._id, members: [], position: 1 });
        //         });
        //         (req as any).user.guilds.push(guild._id);
        //         (req as any).user.save().then(() => {
        //             res.status(200).json({ guild });
        //         });
        //     });
        //     return;
        // }

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
                guild.save().then(() => {
                    Collection.channels.create({ name: "General", type: 0, guildId: guild._id, position: 0 });
                    Collection.channels.create({ name: "General", type: 1, guildId: guild._id, members: [], position: 1 });
                });
                (req as any).user.guilds.push(guild._id);
                (req as any).user.save().then(() => {
                    res.status(200).json({ guild });
                });
            })
            return;
        }

        guild.save().then(() => {
            (req as any).user.guilds.push(guild._id);
            (req as any).user.save().then(() => {
                Collection.channels.create({ name: "General", type: 0, guildId: guild._id, position: 0 });
                Collection.channels.create({ name: "General", type: 1, guildId: guild._id, members: [], position: 1 });
                res.status(200).json({ guild });
            });
        });
    }).catch((err: any) => res.status(400).json({ error: err.message }));
})

export default router;