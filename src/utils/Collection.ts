import IUser from "../../interfaces/IUser";
import Channel from "../models/Channel";
import Guild from "../models/Guild";
import User from "../models/User"

const users = {
    get: async (id: string) => await User.findById(id).populate("guilds"),
    find: async (body: Object) => await User.findOne(body),
    findOr: async (body: Object[]) => await User.findOne({ $or: body }),
    create: async (body: Object) => await User.create(body),
    delete: async (id: string) => await User.findByIdAndDelete(id),
    update: async (id: string, body: IUser) => await User.findByIdAndUpdate(id, body)
}

const guilds = {
    get: async (id: string) => await Guild.findById(id),
    create: async (body: Object) => await Guild.create(body)
}

const channels = {
    get: async(id: string) => await Channel.findById(id),
    create: async(body: Object) => await Channel.create(body)
}

export default {
    users,
    guilds,
    channels
}