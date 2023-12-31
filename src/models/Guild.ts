import { Schema, model } from "mongoose";
import Generator from "../utils/Generator";
import IGuild from "../../interfaces/IGuild";

const schema = new Schema({
    _id: {
        type: String,
        default: () => {
            return Generator.generateSnowflake()
        }
    },
    channels: {
        type: [String],
        ref: "channels",
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    emojis: {
        type: [String],
        default: []
    },
    icon: {
        type: String,
        default: null,
    },
    name: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        default: []
    },
    members: {
        type: [String],
        ref: "guild_members",
        required: true
    }
}, { _id: false });

export default model<IGuild>("guilds", schema);