import { Router } from "express";
import { v4 } from "uuid";
import User from "../database/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt_decode from "jwt-decode";
dotenv.config();
const userRouter = Router();


userRouter.get("/", async (req, res) => {
  try {
    const newUserData = await User.find({});
    res
      .status(200)
      .json({ message: "data fetched succesfully", data: newUserData });
  } catch (err) {
    res.status(404).json({ message: "can't fetch the Data", err });
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const isUserExist = await User.findOne({ email: email });

    if (isUserExist) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const newUserData = new User({
      ...req.body,
      id: v4(),
      isVerified: false,
      password: hashedPassword,
    });

    await newUserData.save();

    const verifyToken = jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const link = `http://localhost:5173/verify?token=${verifyToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ks7997067@gmail.com",
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "your-email@example.com",
      to: email,
      subject: "Verify Your Email",
      text: `Click the following link to verify your email: ${link}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message:
        "User registered successfully. Check your email for verification.",
      newUserData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to register the user" });
  }
});

userRouter.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is missing" });
  }

  try {
    const { email } = jwt.decode(token);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "User is already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify user" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user || !user.isVerified) {
      res.status(404).json({
        code: -1,
        message: "Login failed. User not found or User Not Verified.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res
        .status(401)
        .json({ code: 0, message: "Login failed. Invalid password." });
      return;
    }

    res.status(200).json({
      message: " User Loggedin successfully",
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.json({ code: 0, message: "email not found" });
    return;
  }

  const token = jwt.sign({ id: user._id }, "jwt_secret_key", {
    expiresIn: "1d",
  });

  user.randomToken = token;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ks7997067@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: "ks7997067@gmail.com",
    to: email,
    subject: "Sample Email Subject",
    text: `  http://localhost:5173/resetPassword/${user._id}?token=${token}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error sending email.", error });
  }
});
userRouter.post("/resetPassword/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  const { password } = req.body;
  const user = await User.findOne({_id: id});

  try {
 

    jwt.verify(token, "jwt_secret_key");

    const hash = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate({ _id: id }, { password: hash });
     await User.findByIdAndUpdate({_id:id}, {randomToken:null})

    res.json({ Status: "Success", data: user });
  } catch (err) {
    res
      .status(500)
      .json({ Status: "Internal server error", Error: err.message });
  }
});

export default userRouter;
