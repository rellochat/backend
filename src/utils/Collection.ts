import { Document } from "mongoose";
import IUser from "../../interfaces/IUser";
import Channel from "../models/Channel";
import Guild from "../models/Guild";
import GuildMember from "../models/GuildMember";
import User from "../models/User"

const cache = {
    users: new Map<string, (Document<unknown, {}, IUser> & IUser & Required<{ _id: string; }>) | null>(),
    limits: {
        users: 500
    }
}

const guildMemberUserProjection = { // Define which fields to include/exclude from the user document
    about: 1,
    achivements: 1,
    avatar: 1,
    banner: 1,
    bot: 1,
    createdAt: 1,
    friends: 1,
    guilds: 1,
    permissions: 1,
    status: 1,
    username: 1
};

const users = {
    get: async (id: string) => {
        let user = cache.users.get(id);

        if (user) return user;
        user = await getUser(id);

        if (cache.users.size >= cache.limits.users) {
            const lruUser = cache.users.keys().next().value;
            cache.users.delete(lruUser);
        }

        cache.users.set(id, user);
        return user;
    },
    find: async (criteria: any) => {
        let userToCache = null;

        for (const [id, user] of cache.users.entries()) {
            let allCriteriaMatch = true;

            for (const key in criteria) {
                if ((user as any)[key] !== criteria[key]) {
                    allCriteriaMatch = false;
                    break;
                }
            }

            if (allCriteriaMatch) {
                userToCache = user;
                break;
            }
        }

        if (userToCache) {
            // Return the cached user
            return userToCache;
        }

        const dbUser = await User.findOne(criteria);

        if (dbUser) {
            // Cache the fetched user
            if (cache.users.size >= cache.limits.users) {
                const lruUser = cache.users.keys().next().value;
                cache.users.delete(lruUser);
            }

            cache.users.set(dbUser.id, dbUser);
            return dbUser;
        }

        return null;
    },
    findOr: async (criteriaArray: any[]) => {
        for (const criteria of criteriaArray) {
            let match = false;
            let userToCache = null;

            for (const [id, user] of cache.users.entries()) {
                let allCriteriaMatch = true;

                for (const key in criteria) {
                    if ((user as any)[key] !== criteria[key]) {
                        allCriteriaMatch = false;
                        break;
                    }
                }

                if (allCriteriaMatch) {
                    match = true;
                    userToCache = user;
                    break;
                }
            }

            if (match) {
                // Cache management
                if (cache.users.size >= cache.limits.users) {
                    const lruUser = cache.users.keys().next().value;
                    cache.users.delete(lruUser);
                }

                cache.users.set(userToCache!._id, userToCache);
                return userToCache;
            }
        }

        return null;
    },
    create: async (body: Object) => await User.create(body),
    delete: async (id: string) => await User.findByIdAndDelete(id),
    update: async (id: string, body: IUser) => await User.findByIdAndUpdate(id, body)
}

const guilds = {
    get: async (id: string) => await Guild.findById(id),
    create: async (body: Object) => await Guild.create(body)
}

const guildMembers = {
    get: async (id: string) => await GuildMember.findOne({ user: id }),
    create: async (body: Object) => await GuildMember.create(body),
    delete: async (id: string) => await GuildMember.deleteOne({ user: id })
}

const channels = {
    get: async (id: string) => await Channel.findById(id),
    create: async (body: Object) => await Channel.create(body),
    delete: async (id: string) => await Channel.findByIdAndDelete(id),
}

const getUser = async (id: string) => {
    return await User.findById(id).populate({
        path: "guilds", populate: [
            {
                path: "channels"
            },
            {
                path: "members",
                populate: { path: "user", select: guildMemberUserProjection }
            }
        ]
    })
}

export default {
    users,
    guilds,
    channels,
    guildMembers
}