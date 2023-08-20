import { Schema, model } from "mongoose";
import IGuildMember from "../../interfaces/IGuildMember";
import Generator from "../utils/Generator";

const schema = new Schema({
    _id: {
        type: String,
        default: Generator.generateSnowflake()
    },
    user: {
        type: String,
        ref: "users",
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    roles: {
        type: [String],
        default: []
    },
    joinedAt: {
        type: Date,
        default: new Date()
    },
    deaf: {
        type: Boolean,
        default: false
    },
    mute: {
        type: Boolean,
        default: false
    }
}, { _id: false });

schema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    },
});

export default model<IGuildMember>("guild_members", schema);