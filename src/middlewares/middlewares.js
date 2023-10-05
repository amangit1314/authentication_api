import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
  return token;
};

export const verifyAccessToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Use optional chaining to avoid errors if Authorization header is missing.

  if (typeof token !== "undefined") {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.token = payload;
      next();
    } catch (err) {
      console.log("JWT Verification Error:", err);
      if (err.name === "TokenExpiredError") {
        res.status(401).send({ message: "Token has expired" });
      } else {
        res.status(401).send({ message: "Invalid token" });
      }
    }
  } else {
    console.log(token);
    res.status(401).send({ message: "Access denied. Token is missing" });
  }
};

export const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
  return refreshToken;
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const payload = await jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    return payload.uid;
  } catch (error) {
    console.log(error.message);
  }
};

export const generateVerificationToken = (email) => {
  try {
    const secretKey = process.env.JWT_SECRET;
    const verificationToken = jwt.sign({ email }, secretKey, {
      expiresIn: "30m",
    });

    return verificationToken;
  } catch (error) {
    console.log(error);
    throw new Error(
      "An error occurred while generating the verification token"
    );
  }
};

export const generateResetToken = (email) => {
  try {
    const secretKey = process.env.JWT_SECRET; // Use your JWT secret here
    const resetToken = jwt.sign({ email }, secretKey, {
      expiresIn: "1h", // Set the expiration time for the reset token (e.g., 1 hour)
    });

    return resetToken;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while generating the reset token");
  }
};
