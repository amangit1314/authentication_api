import jwt from "jsonwebtoken";

export const notFound = (req, res, next) => {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
};

export const errorHandler = (req, res, next, err) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

export const validateToken = async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECERT,
        (err, decoded) => {
          if (err) {
            res.status(401);
            throw new Error("User is not authorized");
          }
          req.user = decoded.user;
          next();
        }
      );

      if (!token) {
        res.status(401);
        throw new Error("User is not authorized or token is missing");
      }
    }
  };

export const generateAccessToken = (payload) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
  );
  return token;
};

export const verifyToken = (req, res, next) => {
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
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
  );
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

