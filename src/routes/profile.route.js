import express from "express";
import { verifyRefreshToken, verifyToken } from "../middlewares/middlewares.js";
import { editProfile, getUserData, refreshToken } from "../controllers/profile.controller.js";

const profileRouter = express.Router();

profileRouter.post("/profile", verifyToken, getUserData);
profileRouter.post("/updateEmail", verifyToken, editProfile);

// profileRouter.get("/resetPasswordTokenApi");
profileRouter.post("/resetPassword", verifyToken, editProfile);
// profileRouter.post("/sendEmail");

profileRouter.post("/refreshToken", verifyRefreshToken , refreshToken);
profileRouter.delete("/deleteAccount", verifyToken);

export default profileRouter;