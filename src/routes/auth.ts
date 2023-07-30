import bcrypt from "bcrypt";
import express from "express";
import Collection from "../utils/Collection";
import Validator from "../utils/Validator";
import Generator from "../utils/Generator";
import { verifyToken } from "../middleware/Verification";
const router = express.Router();

router.get("/", verifyToken, async (req: any, res, next) => {
    res.status(200).json({user: req.user});
});

router.post("/login", (req, res) => {
    Validator.validateLogin().validate(req.body).then(() => {
        Collection.users.find({ email: req.body.email }).then(async (user) => {
            if (!user) return res.status(404).json({ error: "Could not find a user for the specified email." });

            const passMatch = await bcrypt.compare(req.body.password, user.password!);
1
            if (!passMatch) return res.status(400).json({ error: "The password you have entered is not correct" });

            res.status(200).json({ token: Generator.generateToken(user) });
        })
    }).catch((err: any) => res.status(400).json({ error: err.message }));
})

router.post("/register", (req, res) => {
    Validator.validateRegister().validate(req.body).then(() => {
        Collection.users.findOr([{ username: req.body.username }, { email: req.body.email }]).then(async (user) => {
            if (user) {
                if (user.email === req.body.email) return res.status(400).json({ error: "A user with this email already exists." });
                if (user.username === req.body.username) return res.status(400).json({ error: "A user with this username already exists." });
                else return res.status(400).json({ error: `A user was found, ${user.secret}, ${req.body.username}` });
            }

            const encryptedPassword = await bcrypt.hash(req.body.password, 12);

            Collection.users.create({
                email: req.body.email,
                username: req.body.username,
                password: encryptedPassword,
            }).then((newUser) => {
                const token = Generator.generateToken(newUser);
                res.status(200).json({ token });
            }).catch((err) => res.status(500).json({ error: "Failed to register user, please try again." }))
        })
    }).catch((err: any) => res.status(400).json({ error: err.message }));
});

export default router;