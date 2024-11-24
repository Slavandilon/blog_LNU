// node app = Запуск сервера. app - назва скрипта
// Ctrl + C = Зупинка сервера

const express = require('express');
const app = express();

// http://localhost:3456/
const PORT = process.env.PORT || 3456;      // традиційний порт, env - змінні середовища
const path = require("path");               // експрес, щоб мати навігацію по папках мусить використовувати вбудовани в ноду модуль path

const mongoose = require("mongoose");       // стандартне підключення
//const db = "mongodb+srv://Danior:qhzxxnL4c2ISWDp3@cluster01.glbbj.mongodb.net/DB_node_blog_LNU";
const db = process.env.MONGO_URI || "mongodb+srv://Danior:qhzxxnL4c2ISWDp3@cluster01.glbbj.mongodb.net/DB_node_blog_LNU";
mongoose.connect(db);

const Post = require("./models/postModel");

const methodOverride = require("method-override"); // для перезаписування в html, бо само по собі html має тільки get i put
app.use(methodOverride("_method"));

// підключаємо додаткові файли
app.use(express.static('assets'));

// кажем, що використовуємо шаблонізатор ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Без цього рядка білий екран при збереженні: 
// зможемо за допомогою цього методу експресу зчитувати дані в форматі "ключ-значення"
app.use(express.urlencoded({ extended: false }));
// дає можливість серверу зчитувати дані з форми
// без цього ніфіга не буде, всім піпєц
// раніше був боді-парсер

/*
створюємо вираз expressFunction. оголосив стрілкову функцію, яка має параметр page;
*не вказуємо фігурні дужки(що виокремлюють тіло функції) бо всього один рядок.

тіло функції: метод(ф-я) join - папка вьюс, і там буде файл .hlml
 */
//let createPath = (page) => path.join(__dirname, "views", `${page}.html`);
//app.use(express.static(path.join(__dirname, "public"))); // команда, що дозволяє node.js лазити по папкам у директорії public.
// у public всі файли, до яких може мати доступ користувач


// ГОЛОВНА
/*
app.get('/', function (req, res) { // якщо в браузері звернемся за цією адресою, що значить головна сторінка
    //res.sendFile(createPath("index")); // браузер видасть файл index
    res.send("<h1>Привіт, Express!.</h1>") // відповідь яку формує сервер і посилає в браузер
});
*/

// ГОЛОВНА СТОРІНКА
app.get('/', (req, res) => {
    res.render('index', {
        title: "PostBlog"
    });
});

// About
app.get('/about', (req, res) => {
    res.render('about', {
        title: "Про додаток"
    });
});

// СТОРІНКА СТВОРЕННЯ ПОСТУ
app.get('/add-post', (req, res) => {
    res.render('add-post', {
        title: "Додавання посту"
    });
});

// Метод створення постів
app.post('/add-post', (req, res) => {
    // збереження даних в ОпеРатиВній пам'яті і виведення прям на екран
    //res.send(req.body);

    // --------- Деструктурізація об'єкта ------------
    const { title, description, author } = req.body;                   // синтаксис ecmascript 6, паралельно витягуємо, це як: const title = req.body.title;...
    const post = new Post({ title, description, author });             // о'єкт класу
    post // екземплярик класу
        .save()
        .then(() => res.redirect("/posts"))             // проміс, при збереження нас перенаправляє на сторінку всіх постів
        .catch((error) => {
            console.log(error);
            res.render("error", { message: error.message });
        });

});

// СТОРІНКА ЗІ ВСІМА ПОСТАМИ
app.get("/posts", (req, res) => {
    Post.find()                                // асинхронна операція пошуку постів
        .then((posts) => res.render("posts", { // файл posts. як знайшли то шо ще робити, треба вивести
            title: "Пости (Записи)",
            posts
        }))
        .catch((error) => {                    // як щось не так, то кричи КАРАУЛ     
            console.log(error);
            res.render("error");
        });
});
// ланцюжкове з'єднання через крапку -- ченнінг

/* 
    РЕДАГУВАННЯ ПОСТА
*/
// Сама сторінка редагування
app.get("/edit-post/:id", (req, res) => {  // :id - кожному об'єкту присвоюється id. 
    let id = req.params.id;                // витягуємо з бд щоб потім працювати з ним в коді
    Post.findById(id)                      // теж асинхронна операція
        .then((post) => res.render("edit-post", {
            title: post.title,
            id: post._id,
            post
        }))
        .catch((error) => {
            console.log(error);
            res.render("error");
        });
});
// редагування поста
app.put("/edit-post/:id", (req, res) => {
    let id = req.params.id;
    const { title, description, author } = req.body;

    Post.findByIdAndUpdate(id, { title, description, author })   // знаходимо і переписуємо
        .then(() => res.redirect(`/posts`))         // і тоді перенаправляємось на сторінку постів
        .catch((error) => {
            console.log(error);
            res.render(createPAth("error"));
        });
});


// КНОПКА ВИДАЛЕННЯ
app.delete("/posts/:id", (req, res) => {
    const id = req.params.id;

    Post.findByIdAndDelete(id)
        .then((posts) => res.render("posts", {
            title: "Post",
            posts
        }))
        .catch((error) => {
            console.log(error);
            res.render("error");
        });
});


// Сторінка поста
app.get("/post/:id", (req, res) => {  // :id поста. 
    const id = req.params.id;         // витягуємо з бд щоб потім працювати з ним в коді
    Post.findById(id)                 // теж асинхронна операція
        .then((post) => res.render("post", {
            title: post.title,
            id: post._id,
            post
        }))
        .catch((error) => {
            console.log(error);
            res.render("error");
        });
});

/* 
    console 
*/
// ЗАСТОСУВАННЯ АСИНХРОННИХ ФУНКЦІЙ async await
async function start() {
    // стандартра конструкція try-catch
    try {
        await mongoose.connect(db);                         // чекаєм поки монгус законектиться за адресою db
        console.log(`Підключення до MongoDB готове!`);    // ТадА в консоль виводимо повідомлення про успіх, все Слава Богу
        app.listen(PORT, () => {                            // і вже ТадА запускаємо сервер
            console.log(`Server слухає на PORT-у ${PORT}...`);
        });
    } catch (error) {
        console.log("\n З'єднання зламалось! Yo-ma-yo!\n\n", error);
    }
}

start();

/*
app.listen(PORT, () => {
    // Повідомлення в командний рядок WINDOWS
    console.log(`Сервер запущено на PORT: ${PORT}.`);
})
*/