export default class Snowflake {

    private inc: number;
    private lastSnowflake: string;
    private relloEpoch: number;

    constructor() {
        this.inc = 0;
        this.lastSnowflake = "";
        this.relloEpoch = 1689461451272;
    }

    public generateSnowflake() {
        const pad = (num: number, by: number) => num.toString(2).padStart(by, '0');

        const msSince = pad(new Date().getTime() - this.relloEpoch, 42);
        const pid = pad(process.pid, 5).slice(0, 5);
        const wid = pad(0 ?? 0, 5);
        const getInc = (add: number) => pad(this.inc + add, 12);

        let snowflake = `0b${msSince}${wid}${pid}${getInc(this.inc)}`;
        (snowflake === this.lastSnowflake)
            ? snowflake = `0b${msSince}${wid}${pid}${getInc(++this.inc)}`
            : this.inc = 0;

        this.lastSnowflake = snowflake;
        return BigInt(snowflake).toString();
    }
}