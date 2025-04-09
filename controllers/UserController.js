import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

import UserModel from "../models/User.js";
// import User from "./models/User.js";

export const register = async (req, res) => {
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
};

export const login = async (req, res) => {
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
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (error) {}
};
