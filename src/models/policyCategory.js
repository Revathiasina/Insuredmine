const { Schema, model } = require('mongoose');

const PolicyCategorySchema = new Schema(
    {
        categoryName: String
    },
    {
        timestamps: true,
    }
);

const policyCategoryModel = model('policyCategory', PolicyCategorySchema);

module.exports = policyCategoryModel;