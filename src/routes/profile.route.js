import express from "express";
import {
  verifyRefreshToken,
  verifyAccessToken,
} from "../middlewares/middlewares.js";
import { editProfile, getUserData, refreshToken } from "../controllers/profile.controller.js";

const profileRouter = express.Router();

profileRouter.delete("/deleteAccount", verifyAccessToken);
profileRouter.post("/profile", verifyAccessToken, getUserData);
profileRouter.post("/updateEmail", verifyAccessToken, editProfile);
profileRouter.post("/updateUsername", verifyAccessToken, editProfile);
profileRouter.post("/updatePassword", verifyAccessToken, editProfile);
profileRouter.post("/generateRefreshToken", verifyRefreshToken , refreshToken);

export default profileRouter;