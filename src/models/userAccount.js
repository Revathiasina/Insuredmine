const { Schema, model } = require('mongoose');

const UserAccountSchema = new Schema(
    {
        accountName: String
    },
    {
        timestamps: true,
    }
);

const userAccountModel = model('userAccount', UserAccountSchema);

module.exports = userAccountModel;