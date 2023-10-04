import express from "express";
import authRouter from "./routes/auth.route.js"; 
import profileRouter from "./routes/profile.route.js"; 

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/auth_api/api/v1/", (req, res) => {
  res.send("Welcome to Authentication API 👮‍♂️ ...");
});
app.use("/auth_api/api/v1/auth", authRouter);
app.use("/auth_api/api/v1/profile", profileRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
