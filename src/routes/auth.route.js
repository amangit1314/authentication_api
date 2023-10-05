import express from 'express';
import { forgotPassword, logOut, loginUser, registerUser } from '../controllers/auth.controller.js';
const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post('/forgotPassword', forgotPassword);
authRouter.delete("/logout", logOut);

export default authRouter;