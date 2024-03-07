const { Schema, model } = require('mongoose');


const PolicyCarrierSchema = new Schema(
    {
        companyName: String
    },
    {
        timestamps: true,
    }
);


const PolicyCarrierModel = model('policyCarrier', PolicyCarrierSchema);

module.exports = PolicyCarrierModel;