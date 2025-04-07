import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { registerValidation } from "./validations/auth.js";
import { validationResult } from "express-validator";

import UserModel from "./models/User.js";
//mongodb+srv://egoryakovenko:pRiojgjWKjmO2T58@cluster0.hyycetn.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0
mongoose
  .connect(
    "mongodb+srv://egoryakovenko:pRiojgjWKjmO2T58@cluster0.hyycetn.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("DB OK");
  })
  .catch((err) => {
    console.log("DB error", err);
  });

const app = express();
app.use(express.json());

app.post("/auth/register", registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  // ======= шифрование пароля =======
  const password = req.body.password; // получаем пароль из запроса req
  const salt = await bcrypt.genSalt(10); // генерирум алгоритьм шифрования "salt"
  const passwordHash = await bcrypt.hash(password, salt); // шифрование
  // ======= /шифрование пароля =======

  const doc = new UserModel({
    email: req.body.email,
    fullName: req.body.fullName,
    avatarUrl: req.body.avatarUrl,
    passwordHash,
  });

  const user = await doc.save(); //сохраняем пользователя в базе

  res.json(user);
});

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
});
