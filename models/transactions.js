const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const trxHASHSchema = new mongoose.Schema({
    network: { type: String, required: true },
    trxSenderAddress: { type: String, required: true },
    trxHash: {
        type: String, required: true
    },
    trxType: { type: String, required: true }
})

module.exports = mongoose.model("trxHash", trxHASHSchema);