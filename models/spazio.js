const mongoose = require("mongoose");

const positiveNumber = {
    type: Number,
    //required: true,
    default: 0,
    validate: (prezzo) => {
        return prezzo >= 0;
    },
};

const schemaSpazio = new mongoose.Schema(
    {
        nome: { type: String, required: true },
        descrizione: String,
        tipologia: String,
        prezzoIniziale: positiveNumber,
        prezzoOra: positiveNumber,
        URLfoto: { type: String, default: "/images/spazi/default.png" },
        servizi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servizio' }]
    }
);

const Spazio = mongoose.model("Spazio", schemaSpazio, "spazi");

module.exports = Spazio;
