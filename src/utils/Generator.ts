import IUser from "../../interfaces/IUser";
import Snowflake from "./Snowflake";

export default class Generator {

    private static snowflake = new Snowflake();

    public static base64UrlEncode(data: string): string {
        if (data) {
            const base64 = Buffer.from(data).toString('base64');
            const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_');
            return base64Url.replace(/=+$/, '');
        } else return ""
    }

    public static base64UrlDecode(encoded: string): string {
        if (encoded) {
            const base64Url = encoded.replace(/-/g, '+').replace(/_/g, '/');
            const paddingLength = 4 - (base64Url.length % 4);
            const paddedBase64 = base64Url + '='.repeat(paddingLength);
            return Buffer.from(paddedBase64, 'base64').toString();
        } else return ""
    }

    public static generateSecret() {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let secret = "";

        for (let i = 0; i < 12; i++) {
            secret += characters[Math.floor(Math.random() * (characters.length - 1))];
        }

        return secret;
    }

    public static generateSnowflake() {
        return this.snowflake.generateSnowflake();
    }

    public static generateToken(user: IUser) {
        const tokenId = this.base64UrlEncode(user._id);
        const tokenLastLogin = this.base64UrlEncode(user.lastLogin.toString());
        const tokenSecret = this.base64UrlEncode(user.secret!);

        return `${tokenId}.${tokenLastLogin}.${tokenSecret}`;
    }

    public static generateDataFromToken(token: string) {

        const splitToken = token.split(".");

        const user: { _id: null | string, lastLogin: null | Date, secret: null | string } = {
            _id: null,
            lastLogin: null,
            secret: null
        }

        user._id = Generator.base64UrlDecode(splitToken[0]);
        user.lastLogin = new Date(Generator.base64UrlDecode(splitToken[1]));
        user.secret = Generator.base64UrlDecode(splitToken[2]);

        return user;
    }
}