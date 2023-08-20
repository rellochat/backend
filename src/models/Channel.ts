import { Schema, model } from "mongoose";
import Generator from "../utils/Generator";
import IGuild from "../../interfaces/IGuild";
import IChannel from "../../interfaces/IChannel";

const schema = new Schema({
    _id: {
        type: String,
        default: () => {
            return Generator.generateSnowflake()
        },
    },
    channels: {
        type: [String],
        ref: "channels"
    },
    guildId: {
        type: String,
        required: true
    },
    members: {
        type: [String]
    },
    name: {
        type: String,
        required: true
    },
    position: {
        type: Number
    },
    topic: {
        type: String,
        default: ""
    },
    type: {
        type: Number,
        required: true
    }

}, { _id: false });

export default model<IChannel>("channels", schema);