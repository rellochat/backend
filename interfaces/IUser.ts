export default interface IUser {
    _id: string,
    about: string,
    achievements: string[]
    avatar: string,
    banner: string,
    blocked: string[] | IUser[],
    bot: boolean,
    createdAt: Date,
    email: string,
    friends: string[] | IUser[],
    guilds: any[],
    lastLogin: Date,
    password?: string,
    pending?: any[]
    permissions: ["read" | "write" | "delete" | "admin"]
    secret?: string,
    status: any,
    username: string,
}