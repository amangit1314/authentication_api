import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  generateVerificationToken,
} from "../middlewares/middlewares.js";
import { sendEmail } from "../utils/send_mail_helper.js";

const prisma = new PrismaClient();
const generateUid = function () {
  return uuidv4();
};
dotenv.config();

// *********** Define a function to validate password complexity ***********
const isPasswordValid = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return passwordRegex.test(password);
};

// ****************************** Register user ****************************
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  //* Check for email and password, both are madatory
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are mandatory!" });
  }

  //* Check if password is valid
  if (!isPasswordValid(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long with at least 1 number, 1 special character, 1 uppercase letter, and 1 lowercase letter.",
    });
  }

  try {
    //* Generate uid for user
    const uuid4 = generateUid();
    console.log("Generated uid: ", uuid4);

    //* Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password: ", hashedPassword);

    //* Check if a user with the given email already exists
    const isUserAlreadyRegistered = await prisma.user.findUnique({
      where: { email },
    });

    //* If already exists send res status 403,
    if (isUserAlreadyRegistered) {
      return res.status(403).json({
        message:
          "Authentication failed. There is already a user with these credentials 🔐👮‍♂️ ...",
      });
    }

    //* Creating a user in the database
    const createdUser = await prisma.user.create({
      data: {
        id: uuid4,
        email,
        name: email.split("@")[0],
        password: hashedPassword,
      },
    });

    //* verification token to verify
    const verificationToken = generateVerificationToken(email);

    //* message to send for verification
    // const msg = {
    //   to: email,
    //   from: "gitaman8481@gmail.com",
    //   subject: "Verify email address using SendGrid",
    //   text: "Click on below text to verify your account,and easy to do anywhere, even with Node.js",
    //   html: `<a href="${verificationToken}"> Click to Verify</a>`,
    // };

    //* sending email using sendgrid
    // sgMail
    //   .send(msg)
    //   .then(() => {
    //     console.log("Email sent: " + msg);
    //     res.status(200).send({
    //       status: true,
    //       data: {
    //         id: createdUser.id,
    //       },
    //       message: "Registration Successful 🎉 + Verification email sent 👮‍♂️",
    //     });
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     console.log(error);
    //     res.status(500).send({
    //       status: false,
    //       message: "Error sending verification email ❗ ...",
    //     });
    //   });
 
    //* Send email function 
    sendEmail(
      email,
      "Verify email address using SendGrid",
      "Click on below text to verify your account,and easy to do anywhere, even with Node.js",
      `<a href="${verificationToken}"> Click to Verify</a>`,
      () => {        
        res.status(200).send({
          status: true,
          data: {
            id: createdUser.id,
          },
          message: "Registration Successful 🎉 + Verification email sent 👮‍♂️",
        });
        console.log("Email sent 🗯📧 ");
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      message: "Internal server error occurred ⚠👮‍♂️...",
    });
  }
};

// *************************** Login User *******************************
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Both email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

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
      name: user.name,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    console.log("Access Token: ", accessToken);
    console.log("Refresh Token: ", refreshToken);

    res.status(200).json({
      status: "OK",
      data: {
        id: user.id,
        email: user.email,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      message: "Login Successful",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "Error",
      message: "An error occurred during login.",
    });
  }
};

//* ************************** Forgot password ********************************
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a reset token and set an expiration time (e.g., 1 hour)
    const resetToken = generateResetToken();

    // Store the reset token and expiration time in the database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour in milliseconds
      },
    });

    // Send an email with the reset token link
    const resetLink = `http://your-frontend-app/reset-password?token=${resetToken}`;
    const emailText = `Click on the following link to reset your password: ${resetLink}`;

    // Use your sendEmail function to send the reset email
    sendEmail(email, "Password Reset Request", emailText, resetLink);

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send reset email." });
  }
};

//* **************************** Logout User ******************************
export const logOut = (req, res) => {
  try {
    res.clearCookie("token");
    res
      .status(200)
      .json({ status: true, data: { message: "Successfull Logged out" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to logout user" });
  }
};
