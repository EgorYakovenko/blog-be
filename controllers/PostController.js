import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec(); //находим статьи по id юзера
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "не удалось получить статьи",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findOneAndUpdate(
      // условия поиска поста
      {
        _id: postId, //Ищем пост по его _id (который передал клиент в URL).
      },
      {
        $inc: { viewsCount: 1 }, // увеличивает счётчик просмотра
      },
      {
        returnDocument: "after", //возвращает обновлённый документ
      }
    );

    if (!doc) {
      return res.status(404).json({
        message: "Статья  не найдена",
      });
    }
    res.json(doc);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "не удалось получить статьи",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id; //находим id статьи

    const doc = await PostModel.findOneAndDelete({ _id: postId }); //находим iстатью по id и удаляем
    // (err, doc) => {
    //   if (err) {
    //     console.log(err);
    //     res.status(500).json({
    //       message: "не удалось удалить статью",
    //     });
    //   }

    if (!doc) {
      return res.status(404).json({
        message: "Статья не найдена",
      });
    }
    res.json({
      success: true,
    });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось удалить статью",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      //Создаётся новый экземпляр модели PostModel — это и есть будущий пост. В него передаются данные из req.body, то есть из тела запроса:
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save(); //Сохраняем созданный объект в базу данных с помощью

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "не удалось создать статью",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id; //находим id статьи
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      }
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "не удалось обновить статью",
    });
  }
};
