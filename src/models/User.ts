import { Schema, model } from "mongoose";
import Generator from "../utils/Generator";
import IUser from "../../interfaces/IUser";

const schema = new Schema({
    _id: {
        type: String,
        default: () => {
            return Generator.generateSnowflake();
        }
    },
    about: {
        type: String,
        default: ""
    },
    achievements: {
        type: [String],
        default: []
    },
    avatar: {
        type: String,
        default: "http://localhost:3001/cdn/images/default_avatar.png"
    },
    banner: {
        type: String,
        default: "color:#E56868"
    },
    blocked: {
        type: [String],
        default: [],
        ref: "users"
    },
    bot: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    email: {
        type: String,
        required: true
    },
    friends: {
        type: [String],
        default: [],
        ref: "users"
    },
    guilds: {
        type: [String],
        default: [],
        ref: "guilds",
    },
    lastLogin: {
        type: Date,
        default: new Date()
    },
    password: {
        type: String,
        required: true
    },
    pending: {
        type: [String],
        default: []
    },
    permissions: {
        type: [String],
        default: ["read", "write", "delete", "admin"]
    },
    secret: {
        type: String,
        default: Generator.generateSecret()
    },
    status: {
        type: String,
        default: "offline"
    },
    username: {
        type: String,
        required: true
    },
}, { _id: false });

export default model<IUser>("users", schema);