//importo mongoose
const mongoose = require("mongoose");

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
    URLfoto: String,
});

//schema dello spazio
const schemaSpazio = new mongoose.Schema({
    nome: { type: String, required: true },
    descrizione: String,
    tipologia: String,
    prezzoIniziale: positiveNumber,
    prezzoOra: positiveNumber,
    URLfoto: { type: String, default: "path/alla/foto/placeholder.png" },
    servizi: [{type: mongoose.Schema.Types.ObjectId, ref: 'Servizio' }],
});


//schema della ricorrenza
const schemaRicorrenza = new mongoose.Schema({
    inizio: { type: Date, required: true },
    fine: { type: Date, required: true },
    spaziPrenotati: [{type: mongoose.Schema.Types.ObjectId, ref: 'Spazio' }],
    serviziPrenotati: [{type: mongoose.Schema.Types.ObjectId, ref: 'Servizio' }],
});

const Spazio = mongoose.model("Spazio", schemaRicorrenza, "spazi");
const Servizio = mongoose.model("Servizio", schemaRicorrenza, "servizi");
const Ricorrenza = mongoose.model("Ricorrenza", schemaRicorrenza, "ricorrenze");


module.exports = Ricorrenza;
