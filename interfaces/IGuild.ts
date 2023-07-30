import IChannel from "./IChannel";

export default interface IGuild {
    _id: string,
    channels: string[] | IChannel[]
    description: string,
    emojis: string[],
    icon: string,
    name: string,
    roles: string[],
}