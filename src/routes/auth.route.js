import express from 'express';
import { logOut, loginUser, registerUser } from '../controllers/auth.controller.js';
const authRouter = express.Router();

authRouter.post("/register", registerUser);
// authRouter.post("/sendEmail");
// authRouter.post("/verifyEmailOnRegisteration");
authRouter.post("/login", loginUser);
authRouter.post('/forgotPassword');
authRouter.delete("/logout", logOut);

export default authRouter;