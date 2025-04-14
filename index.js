import express from "express";

import multer from "multer";
import cors from "cors";

import mongoose from "mongoose";
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations/auth.js";

// import { register, login, getMe } from "./controllers/UserController.js";
import { UserController, PostController } from "./controllers/index.js";

import { checkAuth, handleValidationErrors } from "./utils/index.js";
// import handleValidationErrors from "./utils/handleValidationErrors.js";

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
app.use(cors());
app.use("/uploads", express.static("uploads"));

//=======логика сохранения файла картинки (хранилище)=======
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
//=======/логика сохранения файла картинки (хранилище)=======

//авторизация(поиск пользователя)
app.post(
  "/auth/login",

  loginValidation,
  handleValidationErrors,
  UserController.login
);

//решистрация
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);

//Получение информации о своём профиле
app.get("/auth/me", checkAuth, UserController.getMe);

app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.post(
  "/posts",

  checkAuth,
  handleValidationErrors,
  postCreateValidation,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",

  checkAuth,
  handleValidationErrors,
  postCreateValidation,
  PostController.update
);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
});
