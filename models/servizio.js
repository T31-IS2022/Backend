const mongoose = require('mongoose');

const positiveNumber = {
    type: Number,
    //required: true,
    default: 0,
    validate: (prezzo) => {
        return prezzo >= 0;
    },
};

//schema del servizio
const schemaServizio = new mongoose.Schema({
    nome: { type: String, required: true },
    descrizione: { type: String },
    tipologia: String,
    prezzoIniziale: positiveNumber,
    prezzoOra: positiveNumber,
    URLfoto: {type: String, default: "/default/servizio.jpg"},
},{collection:"servizi"});

const Servizio = mongoose.model("Servizio", schemaServizio);

module.exports = Servizio;