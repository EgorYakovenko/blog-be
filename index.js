import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { registerValidation } from "./validations/auth.js";
import { validationResult } from "express-validator";

import UserModel from "./models/User.js";

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

//авторизация(поиск пользователя)
app.post("/auth/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }); // поиск юзера
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" }); //ответ
    }
    //сравнивание получаемого пароля в теле запроса и в документе пользователя
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    console.log(isValidPass);
    if (!isValidPass) {
      return req.status(400).json({ message: "Логин или пароль не верный" }); //ответ
    }
    //создаём новый токен
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );

    //убираем хеш пароля из тела ответа
    const { passwordHash, ...userData } = user._doc;
    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "не удалось авторизоватся",
    });
  }
});

//решистрация
app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    // ======= шифрование пароля =======
    const password = req.body.password; // получаем пароль из запроса req
    const salt = await bcrypt.genSalt(10); // генерирум алгоритьм шифрования "salt"
    const hash = await bcrypt.hash(password, salt); // шифрование
    // ======= /шифрование пароля =======

    //создание документа пользователя
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save(); //сохраняем пользователя в базе

    //токен пользователя
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );
    //убираем хеш пароля из тела ответа
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "не удалось зарегистрироватся",
    });
  }
});

app.get("/auth/me", (req, res) => {
  try {
  } catch (error) {}
});

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
});
