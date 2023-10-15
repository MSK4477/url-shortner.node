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
console.log(email,isUserExist)
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

    const verifyToken = jwt.sign({ email: email },  "jwt_secret_key", {
      expiresIn: "30m",
    });

    const link = `https://resplendent-cupcake-505e71.netlify.app/verify?token=${verifyToken}`;
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
      subject: "Verify Your Email",
     html:`<h1>Hello ${isUserExist.name}</h1>
     <p>Please Verify Your Email BY Clicking The Link Below..</p>
     <p>The Link Expires In 30 Min</p>
     <a href=${link}>${link}</a>
     `
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
  try {
    const { email, password } = req.body;
console.log(email, password)
    const existingUser = await User.findOne({ email: email });
console.log("exUser",existingUser)
    if (existingUser) {
      const isValidUser = await bcrypt.compare(
        password,
        existingUser.password
      );
console.log(isValidUser)
      if (isValidUser) {

        res.cookie("aToken", email, { expire: new Date() + 86400000 });
        return res.status(201).send({
          message: "User has been signed-in successfully.",
        });
      }
      return res.status(401).send({ message: "Invalid Credentials." });
    }

    return res.status(400).send({
      message: "User does not exist",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
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
    expiresIn: "30m",
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

const  link = `https://resplendent-cupcake-505e71.netlify.app/resetPassword/${user._id}?token=${token}`;

  const mailOptions = {
    from: "ks7997067@gmail.com",
    to: email,
    subject: "reset password",
    html:`<h1>Hello ${user.firstName}</h1>
    <p>Reset The Password By Clicking The Link Below..</p>
    <p>The Link Expires In 30 Min</p>
    <a href=${link}>${link}</a>
    `
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
