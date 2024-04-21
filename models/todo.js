let mongoose = require('mongoose');

// Get the Schema class from mongoose
let Schema = mongoose.Schema;

// Define the schema for the todo model
let todoSchema = new Schema(
    {
        text: { type: String, required: true, max: 100 },
        todoId: { type: String, required: true },
    }
);

// Configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
todoSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'todo' based on the defined schema
let Todo = mongoose.model('todos', todoSchema);

// Export the todo model for use in other modules
module.exports = Todo;

