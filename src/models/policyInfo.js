const { Schema, model } = require('mongoose');


const PolicyInfoSchema = new Schema(
    {
        policyNumber: String,
        policyStartDate: { type: Date, default: null },
        policyEndDate: { type: Date, default: null },
        policyCategoryId: { type: Schema.Types.ObjectId, ref: 'policyCategory' },
        collectionId: { type: Schema.Types.ObjectId, ref: 'userAccount' },
        companyCollectionId: { type: Schema.Types.ObjectId, ref: 'policyCarrier' },
        userId: { type: Number, ref: 'users' }
    },
    {
        timestamps: true,
    }
);

const PolicyInfoModel = model('policyInfo', PolicyInfoSchema);

module.exports = PolicyInfoModel;