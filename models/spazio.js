const mongoose = require("mongoose");

const positiveNumber = {
    type: Number,
    //required: true,
    default: 0,
    validate: (prezzo) => {
        return prezzo >= 0;
    },
};

const schemaServizio = new mongoose.Schema(
    {
        nome: { type: String, required: true },
        descrizione: String,
        tipologia: String,
        prezzoIniziale: positiveNumber,
        prezzoOra: positiveNumber,
        URLfoto: { type: String, default: "/images/servizi/default.png" },
    },
    { collection: "servizi" }
);

const schemaSpazio = new mongoose.Schema(
    {
        nome: { type: String, required: true },
        descrizione: String,
        tipologia: String,
        prezzoIniziale: positiveNumber,
        prezzoOra: positiveNumber,
        URLfoto: { type: String, default: "/images/spazi/default.png" },
        servizi: [schemaServizio],
    },
    { collection: "spazi" }
);

const Spazio = mongoose.model("Spazio", schemaSpazio);

module.exports = Spazio;
