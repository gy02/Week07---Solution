// Import the todo model
const todoModel = require('../models/todo');

// Function to create new todos
exports.create = function (userData) {
    console.log(userData)
    let todo = new todoModel({
        text: userData.text,
        todoId: userData.todoId,
    });
    return todo.save().then(todo => {
        console.log(todo);

        return JSON.stringify(todo);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

// Function to get all todos
exports.getAll = function () {
    // Retrieve all todos from the database
    return todoModel.find({}).then(todos => {
        // Return the list of todos as a JSON string
        return JSON.stringify(todos);
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

