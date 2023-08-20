import IUser from "./IUser";

export default interface IGuildMember {
    _id: string,
    user: string | IUser,
    guildId: string,
    nickname: string | null,
    avatar: string | null,
    roles: string[],
    joinedAt: Date,
    deaf: boolean,
    mute: boolean
}