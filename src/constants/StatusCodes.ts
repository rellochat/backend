export default class StatusCodes {

    static CLOSE = {
        "UNKNOWN_ERROR": {
            CODE: 1000,
            ERROR: "Something went wrong. Try reconnecting?"
        },
        "AUTH_FAILED": {
            CODE: 1001,
            ERROR: "The account token appears to be incorrect."
        },
        "SESSION_TIMEOUT": {
            CODE: 1002,
            ERROR: "It appears that your session has timed out, reconnect to start a new one."
        }
    }
}