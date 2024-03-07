const { Schema, model } = require('mongoose');


const MessagesSchema = new Schema(
    {
        content: String,
        day: String,
        time: String
    },
    {
        timestamps: true,
    }
);

// Create model from the schema
const MessageModel = model('messages', MessagesSchema);

// Export model
module.exports = MessageModel;