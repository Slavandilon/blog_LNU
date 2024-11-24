/*
    Підключення до MongoDB
    https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose#connecting_to_mongodb
*/

// Import the mongoose module
const mongoose = require("mongoose");

// Define a schema: називаємо конструктор схема, викликаючи у монгуса метод схема
const Schema = mongoose.Schema;

const postSchema = new Schema({
    // всі поля в схемі
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    author: {
        type: String,
        required: true,
    },
});

// пов'язуємо схему з моделлю даних
const postModel = mongoose.model("postModel", postSchema);

// експортуємо, щоб вона стала доступною
module.exports = postModel;