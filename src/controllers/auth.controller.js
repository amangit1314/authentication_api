import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/middlewares.js";

const prisma = new PrismaClient();
const generateUid = () => {
  return uuidv4();
};
dotenv.config();

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are mandatory!" });
  }

  try {
    const uuid4 = generateUid();
    const hasedPassword = bcrypt.hash(password, bcrypt.genSalt(10));

    const createdUser = await prisma.user.create({
      data: {
        id: uuid4,
        email,
        password: hasedPassword,
      },
    });

    res.send({
      status: "OK",
      data: {
        id: createdUser.id,
      },
      message: "Registeration Successfull",
    });
  } catch (error) {
    res.error({
      status: "Error",
      data: { message: "Error occured ..." },
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields are mandatory!" });
  }

  try {
    const user = await prisma.user.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Wrong password." });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    res.send({
      status: "OK",
      data: {
        id: user.id,
        email: user.email,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      message: "Login Successfull",
    });
  } catch (error) {
    res.error({
      status: "Error",
      data: { message: "Error occured ..." },
    });
  }
};

export const logOut = (req, res) => {
  res.clearCookie("token");
  res.json({ status: "OK", data: { message: "Successfull Logged out" } });
};
