import { object, string } from 'yup';

export default class Validator {

    public static validateRegister() {
        return object({
            password: string()
                .required()
                .min(8, "A password must be atleast 8 characters long."),
            username: string()
                .required("The username field is required.")
                .min(6, "The username must be atleast 6 characters long and less than 32 characters long.")
                .max(32, "The username must be atleast 6 characters long and less than 32 characters long.")
                .matches(/[A-Za-z0-9]/gm, "A username must not have any spaces, or special characters, A-Z, a-z, 0-9"),
            email: string()
                .required("The email field is required.")
                .email("The email you have provided is invalid.")
        })
    }

    public static validateLogin() {
        return object({
            password: string()
                .required()
                .min(8, "A password must be atleast 8 characters long."),
            email: string()
                .required("The email field is required.")
                .email("The email you have provided is invalid.")
        })
    }

    public static validateGuildCreate() {
        return object({
            name: string().required().min(12, "The server name must be atleast 12 characters long").max(32, "The server name must be less than 32 characters long")
        })
    }
}