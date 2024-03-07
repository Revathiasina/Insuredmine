const { Schema, model } = require('mongoose');

const AgentSchema = new Schema(
    {
        agentName: String
    },
    {
        timestamps: true,
    }
);

const AgentModel = model('agents', AgentSchema);

module.exports = AgentModel;